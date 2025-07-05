from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
from google.oauth2.service_account import Credentials
import random
import string
import time
import requests
from datetime import datetime
import threading
import os
import json

app = Flask(__name__)
CORS(app)

# In-memory storage for demo purposes
appointments = []
otp_store = {}  # { email: { 'otp': '123456', 'expires': timestamp } }

# Google Sheets setup
ENV = os.environ.get('ENV', 'local')
if ENV == 'production':
    service_account_info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT'])
    CREDS = Credentials.from_service_account_info(service_account_info, scopes=['https://www.googleapis.com/auth/spreadsheets'])
    N8N_WEBHOOK_URL = os.environ['N8N_WEBHOOK_URL']
else:
    CREDS = Credentials.from_service_account_file('service_account.json', scopes=['https://www.googleapis.com/auth/spreadsheets'])
    N8N_WEBHOOK_URL = 'https://primary-production-4d39.up.railway.app/webhook/send-otp'

gc = gspread.authorize(CREDS)
SHEET_ID = '1MEdW8nlyaSpUyPYIKFSRScoyqMJpmOxtzH1wsrGpPpA'  # e.g., '1A2B3C4D5E6F7G8H9I0J'
worksheet = gc.open_by_key(SHEET_ID).sheet1

ADMIN_EMAIL = 'anirudhpatilmail@gmail.com'

report_cache = {'data': None, 'timestamp': 0}
report_cache_lock = threading.Lock()
REPORT_CACHE_TTL = 120  # seconds

@app.route('/api/request-otp', methods=['POST'])
def request_otp():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    expires = int(time.time()) + 300  # OTP valid for 5 minutes
    otp_store[email] = {'otp': otp, 'expires': expires}
    # Send OTP via n8n webhook
    try:
        response = requests.post(N8N_WEBHOOK_URL, json={'email': email, 'otp': otp})
        print('n8n webhook response:', response.status_code, response.text)
    except Exception as e:
        print('n8n webhook error:', e)
        return jsonify({'message': 'Failed to send OTP email'}), 500
    return jsonify({'message': 'OTP sent to email'}), 200

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400
    record = otp_store.get(email)
    now = int(time.time())
    if not record or record['expires'] < now:
        return jsonify({'message': 'OTP expired or not found'}), 400
    if record['otp'] != otp:
        return jsonify({'message': 'Invalid OTP'}), 400
    # Patient login restriction: only allow if prescription exists, unless admin
    if email.strip().lower() != ADMIN_EMAIL.lower():
        try:
            records = worksheet.get_all_records()
            patient_rows = [row for row in records if str(row.get('Mail', '')).strip().lower() == email.strip().lower()]
            has_prescription = any(row.get('Prescription') for row in patient_rows)
            if not has_prescription:
                return jsonify({'message': 'Prescription not yet uploaded. Please wait for your doctor/admin.'}), 403
        except Exception as e:
            return jsonify({'message': f'Login check failed: {str(e)}'}), 500
    # Optionally, delete OTP after successful verification
    del otp_store[email]
    return jsonify({'message': 'Login successful'}), 200

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    required_fields = ['name', 'email', 'phone', 'date', 'time']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    # Append to Google Sheet
    worksheet.append_row([
        data['name'],
        data['email'],
        data['phone'],
        data['date'],
        data['time'],
        data.get('notes', '')
    ])
    # Invalidate report cache
    with report_cache_lock:
        report_cache['data'] = None
        report_cache['timestamp'] = 0
    return jsonify({'message': 'Appointment booked successfully!'}), 201

@app.route('/api/upload-prescription', methods=['POST'])
def upload_prescription():
    data = request.get_json()
    email = data.get('email')
    prescription = data.get('details')
    from datetime import datetime
    now = datetime.now()
    current_date = now.strftime('%Y-%m-%d')
    visit_time = now.strftime('%H:%M')
    if not email or not prescription:
        return jsonify({'message': 'Email and details are required'}), 400

    try:
        # Get all records for this email
        records = worksheet.get_all_records()
        patient_rows = [row for row in records if str(row.get('Mail', '')).strip().lower() == email.strip().lower()]
        if not patient_rows:
            return jsonify({'message': 'Patient record not found.'}), 404
        # Use the latest appointment info for this patient
        latest_row = patient_rows[-1]
        name = latest_row.get('Name', '')
        mobilenumber = latest_row.get('Mobilenumber', '')
        appointmentdate = latest_row.get('Appointmentdate', '')
        appointmenttime = latest_row.get('Appointmenttime', '')
        # Determine visit date: max(current_date, appointmentdate)
        visit_date = current_date
        try:
            if appointmentdate:
                appt_dt = datetime.strptime(appointmentdate, '%Y-%m-%d') if '-' in appointmentdate else datetime.strptime(appointmentdate, '%d/%m/%Y')
                if now < appt_dt:
                    visit_date = appointmentdate
        except Exception as e:
            pass  # fallback to current_date if parsing fails
        # Append a new row with all info and new prescription/visit date/time
        worksheet.append_row([
            name,
            email,
            mobilenumber,
            appointmentdate,
            appointmenttime,
            prescription,
            visit_date,
            visit_time
        ])
        # Invalidate report cache
        with report_cache_lock:
            report_cache['data'] = None
            report_cache['timestamp'] = 0
        # Trigger n8n webhook to notify patient
        try:
            requests.post(N8N_WEBHOOK_URL, json={'email': email, 'prescription_uploaded': True})
        except Exception as e:
            print('n8n notification error:', e)
    except Exception as e:
        return jsonify({'message': f'Failed to upload prescription: {str(e)}'}), 500

    return jsonify({'message': 'Prescription uploaded successfully!'}), 201

@app.route('/api/patient-data', methods=['GET'])
def get_patient_data():
    email = request.args.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    try:
        records = worksheet.get_all_records()
        patient_rows = [row for row in records if str(row.get('Mail', '')).strip().lower() == email.strip().lower()]
        if not patient_rows:
            return jsonify({'message': 'No records found for this email.'}), 404
        visits = [
            {
                'appointment_date': row.get('Appointmentdate'),
                'appointment_time': row.get('Appointmenttime'),
                'prescription': row.get('Prescription'),
                'visit_date': row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', ''),
                'visit_time': row.get('Time of visit', '') or row.get('visit_time', '') or row.get('Appointmenttime', '')
            }
            for row in patient_rows
        ]
        first_visit = min((row.get('Appointmentdate') for row in patient_rows if row.get('Appointmentdate')), default=None)
        latest_visit = max((row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', '') for row in patient_rows if (row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', ''))), default=None)
        prescriptions = [
            {
                'prescription': row.get('Prescription'),
                'visit_date': row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', ''),
                'visit_time': row.get('Time of visit', '') or row.get('visit_time', '') or row.get('Appointmenttime', '')
            }
            for row in patient_rows if row.get('Prescription')
        ]
        return jsonify({
            'first_visit': first_visit,
            'latest_visit': latest_visit,
            'prescriptions': prescriptions,
            'visits': visits
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch patient data: {str(e)}'}), 500

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    try:
        records = worksheet.get_all_records()
        appointments = []
        for idx, row in enumerate(records):
            # Normalize keys
            appointment = {
                'id': idx + 1,
                'name': row.get('Name', ''),
                'email': row.get('Mail', ''),
                'phone': row.get('Mobilenumber', ''),
                'date': row.get('Appointmentdate', ''),
                'time': row.get('Appointmenttime', ''),
                'notes': row.get('Notes', ''),
                'prescription': row.get('Prescription', ''),
                'visit_date': row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', ''),
                'visit_time': row.get('Time of visit', '') or row.get('visit_time', '') or row.get('Appointmenttime', '')
            }
            if appointment['name'] and appointment['date']:
                appointments.append(appointment)
        return jsonify({'appointments': appointments}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch appointments: {str(e)}'}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    import time
    now = time.time()
    with report_cache_lock:
        if report_cache['data'] and now - report_cache['timestamp'] < REPORT_CACHE_TTL:
            return jsonify(report_cache['data'])
    try:
        import calendar
        from datetime import datetime, timedelta
        records = worksheet.get_all_records()
        # Pre-parse dates and build lists
        parsed_appointments = []
        parsed_visits = []
        for row in records:
            name = row.get('Name')
            appt_date_str = row.get('Appointmentdate')
            visit_date_str = row.get('Date of visit', '') or row.get('date of visit', '') or row.get('Visit_date', '') or row.get('visit_date', '')
            prescription = row.get('Prescription')
            # Parse appointment date
            appt_date = None
            if appt_date_str:
                try:
                    if '/' in appt_date_str:
                        day, month, year = appt_date_str.split('/')
                        appt_date = datetime(int(year), int(month), int(day))
                    elif '-' in appt_date_str:
                        year, month, day = appt_date_str.split('-')
                        appt_date = datetime(int(year), int(month), int(day))
                except:
                    appt_date = None
            # Parse visit date
            visit_date = None
            if visit_date_str:
                try:
                    if '/' in visit_date_str:
                        day, month, year = visit_date_str.split('/')
                        visit_date = datetime(int(year), int(month), int(day))
                    elif '-' in visit_date_str:
                        year, month, day = visit_date_str.split('-')
                        visit_date = datetime(int(year), int(month), int(day))
                except:
                    visit_date = None
            if name and appt_date:
                parsed_appointments.append({'row': row, 'date': appt_date})
            if prescription and visit_date:
                parsed_visits.append({'row': row, 'date': visit_date})
        # Calculate statistics
        total_appointments = len(parsed_appointments)
        total_visits = len(parsed_visits)
        pending_appointments = total_appointments - total_visits
        # Monthly statistics (last 6 months)
        monthly_stats = []
        for i in range(6):
            date = datetime.now() - timedelta(days=30*i)
            month = date.month
            year = date.year
            month_appt_count = sum(1 for appt in parsed_appointments if appt['date'].month == month and appt['date'].year == year)
            month_visit_count = sum(1 for visit in parsed_visits if visit['date'].month == month and visit['date'].year == year)
            monthly_stats.append({
                'month': calendar.month_name[month],
                'year': year,
                'appointments': month_appt_count,
                'visits': month_visit_count
            })
        result = {
            'total_appointments': total_appointments,
            'total_visits': total_visits,
            'pending_appointments': pending_appointments,
            'monthly_stats': monthly_stats
        }
        with report_cache_lock:
            report_cache['data'] = result
            report_cache['timestamp'] = now
        return jsonify(result)
    except Exception as e:
        return jsonify({'message': f'Failed to generate reports: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
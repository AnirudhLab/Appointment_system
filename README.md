# 🏥 PhysioCare Hospital Management System

**License:** MIT  
**Python Version:** 3.11+  
**Frontend:** React (Vite, Material-UI)  
**Backend:** Flask  
**Database:** Google Sheets  
**Automation:** n8n  
**Deployment:** Render, Local, or Docker  
**PRs:** Welcome!  
**Stars:** ⭐  
**Forks:** 🍴  
**Issues:** 🐞

A modern, full-stack, cloud-ready physiotherapy hospital management system. Book appointments, manage patients, upload prescriptions, and automate notifications—all with a beautiful, responsive UI and secure, scalable backend.

---

## 📑 Table of Contents
- ✨ Key Features
- 🚀 Installation
- ⚡ Quick Start
- 🔒 Production Setup
- 📖 Usage
- 🛠️ Configuration
- 🏥 Features & How It Works
- 🚀 Usage Examples
- 🧑‍💻 Best Practices
- 🩺 Troubleshooting
- 📞 Contact
- 📚 Additional Documentation

---

## ✨ Key Features
- 🗓️ **Appointment Booking:** Patients can book slots with time validation and receive email confirmations.
- 🔑 **OTP Login:** Secure, email-based OTP login for patients and admin.
- 📋 **Patient Dashboard:** View visit and prescription history.
- 🩺 **Admin Dashboard:** Upload prescriptions, manage patients, view analytics.
- 📊 **Reports & Analytics:** Real-time stats, patient management, and visit tracking.
- 📧 **Automated Notifications:** n8n integration for OTP and prescription emails.
- 📱 **Responsive UI:** Modern, mobile-friendly design with Material-UI.
- 🔒 **Secure Secrets:** Environment variable-based secret management.
- 🌐 **Cloud & Local Ready:** Works on Render, Railway, or your own server.

---

## 🚀 Installation

### 1. **Clone the Repository**
```sh
git clone https://github.com/AnirudhLab/Appointment_system.git
cd Appointment_system
```

### 2. **Backend Setup**
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Add your .env file (see below)
```

### 3. **Frontend Setup**
```sh
cd ../frontend
npm install
# Add your .env file (see below)
```

---

## ⚡ Quick Start (Local)

### **Backend**
```sh
cd backend
source venv/bin/activate
python app.py
```

### **Frontend**
```sh
cd frontend
npm run dev
```

---

## 🔒 Production Setup (Render/Cloud)
- Set all secrets (Google service account, n8n webhook, etc.) as environment variables in the Render dashboard.
- Use `gunicorn app:app` as the backend start command.
- Set `VITE_API_URL` in the frontend environment variables to your backend's public URL.

---

## 📖 Usage
- **Book Appointment:** Patients fill out the form and select a time slot.
- **Login:** OTP sent to email for secure access.
- **Admin:** Upload prescriptions, manage patients, view reports.
- **Notifications:** Automated via n8n webhooks.

---

## 🛠️ Configuration

### **Backend .env Example**
```
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/send-otp
GOOGLE_SERVICE_ACCOUNT={...}
FLASK_SECRET_KEY=your-secret
```

### **Frontend .env Example**
```
VITE_API_URL=http://localhost:5000
```

---

## 🏥 Features & How It Works
- **Google Sheets Integration:** All patient and appointment data is stored in Google Sheets for easy access and backup.
- **n8n Automation:** Handles all email notifications for OTP and prescription uploads.
- **Role-Based Access:** Only the configured admin email (`venkateshmanick@gmail.com`) can access admin features.
- **Responsive Design:** Works seamlessly on desktop and mobile.

---

## 🚀 Usage Examples
- **Book an Appointment:**  
  Patient → Book → Fill form → Receive OTP → Confirm booking.
- **Admin Uploads Prescription:**  
  Admin → Login with OTP → Upload prescription → Patient notified via email.
- **Reports:**  
  Admin → Dashboard → View analytics and patient history.

---

## 🧑‍💻 Best Practices
- **Use virtual environments** for Python dependencies.
- **Never commit secrets** (`.env`, `service_account.json`) to git.
- **Set all production secrets** in your cloud provider's dashboard.
- **Test locally** before deploying to production.

---

## 🩺 Troubleshooting
- **OTP not sending:** Check `N8N_WEBHOOK_URL` and n8n workflow status.
- **Google Sheets errors:** Ensure service account has access to the sheet.
- **CORS issues:** Confirm CORS is enabled in Flask.
- **Frontend not connecting:** Check `VITE_API_URL` in frontend `.env`.

---

## 📞 Contact
- **Email:** anirudhpatilmail@gmail.com
- **GitHub:** [AnirudhLab/Appointment_system](https://github.com/AnirudhLab/Appointment_system)

---

## 📚 Additional Documentation
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [n8n Documentation](https://docs.n8n.io/)
- [Render Deployment Guide](https://render.com/docs/deploy-flask)
- [Material-UI Docs](https://mui.com/)

---

## 📝 License
MIT License - feel free to use and modify as needed.

---

**Happy deploying and managing your physiotherapy hospital with PhysioCare! 🏥✨** 

# 📱 Mobile Access Setup Guide

This guide will help you run your SGPA Calculator on your mobile device!

## 🚀 Quick Start

### Option 1: Using the Mobile Startup Script (Recommended)

1. **Run the mobile startup script:**
   ```batch
   start_project_mobile.bat
   ```

2. **Note your IP address** displayed in the console (e.g., `192.168.1.100`)

3. **On your mobile device:**
   - Make sure you're on the **same WiFi network** as your computer
   - Open your mobile browser (Chrome, Safari, etc.)
   - Navigate to: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

### Option 2: Manual Setup

#### Step 1: Find Your Computer's IP Address

Run this command in PowerShell:
```powershell
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter (usually starts with `192.168.` or `10.`)

#### Step 2: Start Backend with Network Access

```batch
cd backend
call .\venv\Scripts\activate
set FLASK_RUN_HOST=0.0.0.0
python app.py
```

#### Step 3: Start Frontend with Network Access

Open a new terminal:
```batch
cd frontend
set REACT_APP_API_URL=http://YOUR_IP_ADDRESS:5000
set HOST=0.0.0.0
npm start
```

#### Step 4: Access from Mobile

On your mobile device (same WiFi):
- Open browser
- Go to: `http://YOUR_IP_ADDRESS:3000`

## 🔧 Troubleshooting

### Can't Access from Mobile?

1. **Check Firewall:**
   - Windows Firewall might be blocking connections
   - Allow Python and Node.js through the firewall

2. **Check WiFi Network:**
   - Both devices MUST be on the same WiFi network
   - Some public/guest WiFi networks block device-to-device communication

3. **Check IP Address:**
   - Make sure you're using the correct IP address
   - IP addresses can change, so verify it's current

### Firewall Configuration

If you're having connection issues, you may need to allow the ports through Windows Firewall:

```powershell
# Allow Flask (port 5000)
netsh advfirewall firewall add rule name="Flask Dev Server" dir=in action=allow protocol=TCP localport=5000

# Allow React (port 3000)
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000
```

## 📝 Notes

- **Development Only:** This setup is for development/testing only
- **Same Network Required:** Both devices must be on the same WiFi
- **IP Changes:** Your computer's IP might change if you reconnect to WiFi
- **Performance:** Mobile browsers might be slower than desktop for file uploads

## 🎯 What Works on Mobile

✅ Upload PDF files (if your mobile browser supports file uploads)
✅ View results and charts
✅ See CGPA calculations
✅ Get AI study tips
✅ All animations and visual effects

## ⚠️ Limitations

- Some mobile browsers may have file upload restrictions
- Large PDF files might take longer to upload on mobile data
- Best experience on WiFi connection

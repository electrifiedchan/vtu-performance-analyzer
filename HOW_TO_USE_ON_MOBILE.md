# 📱 How to Use on Mobile - SIMPLE GUIDE

## Step 1: Get Your Computer's IP Address

Open Command Prompt or PowerShell and run:
```
ipconfig
```

Look for **"IPv4 Address"** - it will look like:
- `192.168.1.100` or
- `10.0.0.5` or
- `172.16.0.10`

**Write this down!** You'll need it.

## Step 2: Start Your Servers

**Close any running servers first**, then run:
```
start_project.bat
```

Wait for both servers to start (you'll see two command windows open).

## Step 3: Open on Your Mobile

On your **mobile phone or tablet**:

1. **Make sure you're on the SAME WiFi** as your computer
2. Open your mobile browser (Chrome, Safari, etc.)
3. Type in the address bar:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   
   **Example:** If your IP is `192.168.1.100`, type:
   ```
   http://192.168.1.100:3000
   ```

4. Press Enter/Go

**That's it!** Your SGPA Calculator should now load on your mobile! 🎉

---

## ❓ Not Working? Quick Fixes:

### Problem: Can't connect from mobile

**Solution 1: Check WiFi**
- Both devices MUST be on the same WiFi network
- Not mobile data, not different WiFi

**Solution 2: Check Firewall**
Run these commands in PowerShell (as Administrator):
```powershell
netsh advfirewall firewall add rule name="Flask" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="React" dir=in action=allow protocol=TCP localport=3000
```

**Solution 3: Restart Servers**
- Close both server windows
- Run `start_project.bat` again

### Problem: Page loads but can't upload files

This is normal - the backend is working! The error you showed in the screenshot ("Failed to fetch") might be because:
- The backend wasn't configured for network access (now fixed!)
- Firewall is blocking (see Solution 2 above)

---

## 🎯 What Changed?

I made 2 simple changes so mobile devices can connect:

1. **Backend (`app.py`)**: Now accepts requests from any device on your network
2. **Startup script (`start_project.bat`)**: React now listens on all network interfaces

**Nothing complicated** - just these 2 small changes! 😊

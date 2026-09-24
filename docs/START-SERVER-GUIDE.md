
================================================================================
🚀 START FRONTEND & BACKEND - MANUAL GUIDE (STEP-BY-STEP)
================================================================================

CURRENT STATUS:
✅ Backend API server already started in separate window
❌ Frontend Next.js needs to be started manually

================================================================================
STEP 1: OPEN COMMAND PROMPT AT FRONTEND FOLDER
================================================================================

Press Win + R on keyboard
Type: cmd
Press Enter

In Command Prompt, type these commands ONE BY ONE:

cd C:\Users\Microsoft\Documents\Ngoding\KP\frontend

Then press Enter.

You should see prompt like:
C:\Users\Microsoft\Documents\Ngoding\KP\frontend>

================================================================================
STEP 2: START NEXT.JS DEVELOPMENT SERVER
================================================================================

Now type this command and press Enter:

npm run dev

You will see output like:
- Checking validity of types...
- Compiled successfully!
- Ready in X ms
- ○ Local:   http://localhost:3000

Wait until you see "Ready in X ms" message!

================================================================================
STEP 3: OPEN BROWSER AND TEST
================================================================================

1. Open Google Chrome browser
2. Type in address bar: http://localhost:3000
3. Press ENTER
4. Press CTRL + SHIFT + R (hard refresh)

================================================================================
EXPECTED RESULT - ALL GREEN ✅:
================================================================================

✅ Red error banner disappears completely
✅ Dashboard shows:
   • Total Karyawan: 26 (not 0!)
   • Kualitas Model: Actual score value
   • Kategori Karyawan: 3 (High/Medium/Low)
   • Status Periode: 2026-09
   
✅ Menu navigation is fast (< 500ms per click)
✅ No red CORS errors in Console (F12)
✅ All API calls return 200 OK in Network tab

================================================================================
IMPORTANT NOTES:
================================================================================

• KEEP THE BEHIND WINDOW OPEN! This is the API server
• The frontend terminal must stay open while using the app
• Don't close either window until you're done testing

================================================================================
TROUBLESHOOTING:
================================================================================

Problem: npm command not found
Solution: Install Node.js from https://nodejs.org/
          Or use nodejs if already installed via Windows Store

Problem: Port 3000 already in use
Solution: Close other apps using port 3000 or restart computer

Problem: Frontend starts but still no data
Solution: Check backend window - it should show log messages like:
         [HH:MM:SS] GET /api/v1/employees HTTP/1.1
         If NO messages appear, backend might have crashed

Problem: CORS errors still appear
Solution: Make sure backend window is open and showing logs
          If backend window closed by accident, restart:
          cd backend && python api_bridge_server.py

================================================================================
TO STOP SERVERS AFTER TESTING:
================================================================================

1. In Frontend console window: Press Ctrl+C
2. In Backend window: Press Ctrl+C
3. Both windows can now be closed safely

================================================================================
SUCCESS CHECKLIST:
================================================================================

Before you consider it complete, verify:
☐ Backend window shows server running
☐ Frontend window shows "Ready"
☐ Browser loads localhost:3000 without ERR_CONNECTION_REFUSED
☐ No red error banner at top of dashboard
☐ Dashboard shows correct employee count (26)
☐ All menus work without freezing
☐ No red errors in DevTools Console (F12)

If all checkboxes are checked - YOU'RE DONE! 🎉

================================================================================
Generated for SIM Kinerja Project | Last Updated: 2026-09-22
================================================================================

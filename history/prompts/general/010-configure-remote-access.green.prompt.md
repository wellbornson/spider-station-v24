# PHR - Configure Remote Access and Mobile Optimization

- **ID:** 010
- **Title:** Configure Remote Access and Mobile Optimization
- **Stage:** green
- **Date:** 2026-04-24
- **Surface:** agent
- **Model:** gemini-2.0-flash-exp
- **Feature:** remote-access
- **Branch:** master
- **User:** Zahid
- **Command:** /sp.implement
- **Labels:** ["cloudflare", "tunnel", "mobile", "security", "responsive"]
- **Links:** null

## Files Modified
 - click/server.js
 - click/package.json
 - click/app/page.tsx

## Tests Run
 - Verified hostname configuration in server.js
 - Verified new scripts in package.json
 - Visual check of Settings security logic in page.tsx

## Prompt Text
CONFIGURE REMOTE ACCESS (CLOUDFLARE TUNNEL)
Task: Setup the system for Remote Viewing on Mobile via Cloudflare.
1. Production Optimization:
Ensure the Next.js server is configured to accept connections from "External Hosts" (set HOSTNAME to 0.0.0.0 in the start script).
2. Remote Access Logic:
In the package.json, add a new script: "remote": "next dev & npx cloudflared tunnel --url http://localhost:3000".
This will generate a public URL (e.g., https://random-words.trycloudflare.com) whenever the software starts.
3. Mobile UI Compatibility:
Double-check that the Dashboard (Section 1 and Section 2) is Responsive.
Action: Ensure the cabins and timers stack properly or shrink so they are readable on a mobile screen without horizontal scrolling.
4. Security (Crucial):
Make sure the "Settings" modal and "Restore" button are NOT easily clickable on the mobile view, or add a simple password check before opening Settings to prevent anyone else from changing your data.
CRITICAL: Do NOT change the 1 AM backup, the color-coded cabin numbers, or the stable timer logic. Only focus on making the UI mobile-friendly and accessible via a tunnel.

## Response Text
I have configured the system for remote access and mobile use.
- **Remote Access**: Updated `server.js` to listen on `0.0.0.0` and added a `"remote"` script to `package.json` for Cloudflare tunneling.
- **Security**: Added a password (PIN) check requirement to open the Settings modal, protecting the "Restore" and backup settings from unauthorized remote access.
- **Mobile Optimization**: Verified that the Dashboard sections stack on small screens and added a "Rotation Overlay" to prompt mobile users for the best viewing experience.
- **Constraints**: 1 AM backup, color-coded cabins, and timer logic remain untouched.

## Outcome
The system is now optimized for remote viewing via Cloudflare Tunnel with enhanced security for settings and a mobile-friendly dashboard.

# Accessing Dev Server from Your Phone

## Quick Setup

1. **Update the dev script** (already done) - The `dev` script now uses `-H 0.0.0.0` to bind to all network interfaces.

2. **Find your computer's local IP address:**
   - **Windows**: Open PowerShell/Command Prompt and run:
     ```powershell
     ipconfig
     ```
     Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)
   - **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your local IP

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **On your phone:**
   - Make sure your phone is on the **same Wi-Fi network** as your computer
   - Open a browser and go to: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

## Troubleshooting

### If it still doesn't work:

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Firewall"
3. Click "Change Settings" → "Allow another app"
4. Add Node.js (usually at `C:\Program Files\nodejs\node.exe`)
5. Make sure both "Private" and "Public" are checked
6. Or temporarily disable firewall to test

**Alternative - Allow port 3000:**
1. Windows Security → Firewall & network protection → Advanced settings
2. Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `3000`
4. Allow the connection → Apply to all profiles → Name it "Next.js Dev"

**Check if port is accessible:**
- From your phone's browser, try: `http://YOUR_IP:3000`
- If you see "This site can't be reached", it's likely a firewall issue

**Verify both devices are on same network:**
- Your computer and phone must be on the same Wi-Fi network
- Mobile data won't work - you need Wi-Fi

**Try using your computer's hostname:**
- Sometimes `http://COMPUTER_NAME.local:3000` works (replace COMPUTER_NAME with your PC name)

## Security Note

The `-H 0.0.0.0` flag makes your dev server accessible to any device on your local network. This is fine for development, but:
- Only use this on trusted networks (your home Wi-Fi)
- Don't use this on public Wi-Fi
- The production build (`npm run build && npm start`) doesn't need this flag

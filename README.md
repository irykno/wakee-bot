# ⚡ Wakee (Wakeup Bot)

A professional, serverless Discord management and wake-up bot built for **Cloudflare Workers**. Features a built-in web dashboard for managing multiple Render services, automated cron pings, and secure on-demand UI wake-ups.

## 🚀 One-Click Auto Installation

1. Click the button below to deploy the **Installer Worker** to your Cloudflare account.
2. Open the provided Worker URL (e.g., `https://wakee-bot.your-subdomain.workers.dev`).
3. You will see the **Auto-Setup Wizard**.
4. Enter your Cloudflare Account ID, an API Token (with Workers & KV Edit permissions), your Discord Bot Token, and a Panel Password.
5. Click "Start Installation". The worker will automatically:
   - Create the required KV Namespace.
   - Download the full bot code from this repository.
   - Deploy the full code and bind the KV.
   - Securely store your tokens as Cloudflare Secrets.
   - Set up the 15-minute auto-wake Cron Job.
6. You will be redirected to the login page of your new dashboard!

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/irykno/wakee-bot)

## 📜 Policies
- **Terms of Service:** [View Here](https://h4m1dr.github.io/wakeup/terms.html)
- **Privacy Policy:** [View Here](https://h4m1dr.github.io/wakeup/privacy.html)

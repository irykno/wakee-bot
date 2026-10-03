# ⚡ Wakee (Wakeup Bot)

A lightweight, serverless Discord management and wake-up bot built for **Cloudflare Workers**. Designed to keep your free-tier cloud services (like Render) alive using on-demand Discord UI buttons and randomized smart pings.

---

## Features

- **🚀 On-Demand UI Wake-up:** Wake up your sleeping Render or cloud services instantly using modern Discord buttons.
- **🕒 Smart Randomized Crons:** Automatically triggers randomized pings within specified active time windows to avoid robotic patterns.
- **☁️ Cloudflare Edge Hosted:** Runs globally on Cloudflare Workers with zero sleep timeout and absolute reliability.
- **🔒 Secure Interactions:** Validates all incoming Discord webhook signatures natively.

---

## 🚀 Quick Start (Two-Stage Automated Deployment)

1. Click the button below to deploy the **Seed Worker** to your Cloudflare account.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/h4m1dr/wakeup)

2. Open the provided Worker URL (e.g., `https://wakee-bot.your-subdomain.workers.dev`).
3. Follow the **Setup Wizard** on the page. It will automatically:
   - Create a KV Namespace (`WAKEE_KV`).
   - Inject the full bot code.
   - Securely store your Discord Token and Admin Password.
   - Set up a Cron Job for automated wake-ups.


## 🛠 Manual Setup (If needed)
If the automated wizard fails, you can manually:
1. Create a KV Namespace named `WAKEE_KV` in Cloudflare.
2. Copy the contents of `full_worker.js` into your Worker.
3. Bind the KV Namespace to the variable `WAKEE_KV`.
4. Add Secrets: `DISCORD_TOKEN` and `ADMIN_PASSWORD`.
5. Set a Cron Trigger to `*/15 * * * *`.

## 📜 Policies
- **Terms of Service:** [View Here](https://h4m1dr.github.io/wakeup/terms.html)
- **Privacy Policy:** [View Here](https://h4m1dr.github.io/wakeup/privacy.html)

---

## License

MIT License

---

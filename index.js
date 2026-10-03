// Wakee Bot - Smart Installer Wizard (Server-Side Proxy)

const WIZARD_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>راه‌اندازی خودکار Wakee | Auto Installer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-3xl w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 class="text-3xl font-bold text-blue-400 mb-2 text-center">⚡ نصب خودکار Wakee Bot</h1>
        <p class="text-center text-slate-400 mb-8 text-sm">اطلاعات زیر را وارد کنید تا ربات به صورت کاملاً خودکار پیکربندی، KV ساخته و کد اصلی جایگزین شود.</p>

        <div class="space-y-6">
            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-yellow-500">
                <h3 class="font-bold text-lg mb-3 text-yellow-300">۱. اطلاعات حساب کلادفلر</h3>
                <label class="block text-sm mb-1">Account ID:</label>
                <input type="text" id="cfAccountId" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white mb-3 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="مثال: 8d5a...">
                <a href="https://dash.cloudflare.com/?to=/:account/workers" target="_blank" class="text-xs text-blue-400 hover:underline mb-4 block">🔗 پیدا کردن Account ID</a>

                <label class="block text-sm mb-1">Cloudflare API Token:</label>
                <input type="password" id="cfApiToken" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white mb-2 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="توکن با دسترسی‌های Workers Edit و KV Edit">
                <p class="text-xs text-slate-400 mb-3">⚠️ هنگام ساخت توکن، الگوی "Edit Cloudflare Workers" را انتخاب کرده و دسترسی Account > Workers KV Storage > Edit را نیز دستی اضافه کنید.</p>
                <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" class="text-xs text-blue-400 hover:underline">🔗 ساخت توکن جدید در کلادفلر</a>
            </div>

            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-green-500">
                <h3 class="font-bold text-lg mb-3 text-green-300">۲. تنظیمات ربات</h3>
                <label class="block text-sm mb-1">Discord Bot Token:</label>
                <input type="password" id="discordToken" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white mb-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="توکن ربات دیسکورد">
                
                <label class="block text-sm mb-1">رمز عبور مدیریت پنل (Admin Password):</label>
                <input type="password" id="adminPass" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="یک رمز قوی برای ورود به پنل">
            </div>

            <button id="installBtn" onclick="startInstallation()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition duration-200 text-lg shadow-lg">
                🚀 شروع نصب خودکار و ارتقای ورکر
            </button>
            
            <div id="statusLog" class="hidden bg-black rounded p-4 font-mono text-xs text-green-400 h-40 overflow-y-auto border border-slate-700 mt-4"></div>
        </div>
    </div>

    <script>
        function log(msg) {
            const logBox = document.getElementById('statusLog');
            logBox.classList.remove('hidden');
            logBox.innerHTML += '> ' + msg + '<br>';
            logBox.scrollTop = logBox.scrollHeight;
        }

        async function startInstallation() {
            const accountId = document.getElementById('cfAccountId').value.trim();
            const apiToken = document.getElementById('cfApiToken').value.trim();
            const discordToken = document.getElementById('discordToken').value.trim();
            const adminPass = document.getElementById('adminPass').value.trim();
            const btn = document.getElementById('installBtn');

            if (!accountId || !apiToken || !discordToken || !adminPass) {
                alert('لطفاً تمام فیلدها را پر کنید!');
                return;
            }

            btn.disabled = true;
            btn.innerText = '⏳ در حال پیکربندی... (لطفاً ۳۰ ثانیه صبر کنید)';
            log('شروع فرآیند نصب سمت سرور...');

            try {
                const res = await fetch('/api/install', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountId, apiToken, discordToken, adminPass })
                });
                
                const data = await res.json();
                
                if (data.success) {
                    log('✅ نصب با موفقیت کامل شد! در حال انتقال به پنل...');
                    setTimeout(() => { window.location.href = '/login'; }, 2000);
                } else {
                    throw new Error(data.error || 'خطای ناشناخته در نصب');
                }
            } catch (error) {
                log('❌ خطا: ' + error.message);
                btn.disabled = false;
                btn.innerText = '🚀 تلاش مجدد برای نصب';
            }
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/setup") {
      return new Response(WIZARD_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname === "/api/install" && request.method === "POST") {
      const { accountId, apiToken, discordToken, adminPass } = await request.json();
      const workerName = "wakee-bot";
      const kvName = "WAKEE_KV";
      
      // ✅ اصلاح شده: لینک به ریپوزیتوری جدید شما
      const rawWorkerUrl = "https://raw.githubusercontent.com/irykno/wakee-bot/main/full_worker.js";

      try {
        let kvId = null;
        const listRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`, {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        const listData = await listRes.json();
        const existingKv = listData.result.find(k => k.title === kvName);
        
        if (existingKv) {
            kvId = existingKv.id;
        } else {
            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: kvName })
            });
            const kvData = await kvRes.json();
            if (!kvData.success) throw new Error("خطا در ساخت KV: " + JSON.stringify(kvData.errors));
            kvId = kvData.result.id;
        }

        const scriptRes = await fetch(rawWorkerUrl);
        if (!scriptRes.ok) throw new Error("عدم دسترسی به کد اصلی در گیت‌هاب. مطمئن شوید full_worker.js وجود دارد.");
        const scriptCode = await scriptRes.text();

        const formData = new FormData();
        formData.append("metadata", JSON.stringify({
          main_module: "worker.js",
          bindings: [{ name: "WAKEE_KV", type: "kv_namespace", namespace_id: kvId }]
        }));
        formData.append("worker.js", new Blob([scriptCode], { type: "application/javascript+module" }));

        const uploadRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${apiToken}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error("خطا در آپلود کد: " + JSON.stringify(uploadData.errors));

        const secrets = [
          { name: "DISCORD_TOKEN", text: discordToken },
          { name: "ADMIN_PASSWORD", text: adminPass }
        ];
        for (const secret of secrets) {
          const secRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}/secrets`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: secret.name, text: secret.text, type: "secret_text" })
          });
          const secData = await secRes.json();
          if (!secData.success) throw new Error(`خطا در ذخیره ${secret.name}: ` + JSON.stringify(secData.errors));
        }

        await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}/schedules`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ cron: ["*/15 * * * *"] })
        });

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};

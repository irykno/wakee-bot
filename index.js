// Wakee Bot - Stage 1: Smart Setup Wizard (CORS-Safe)
const WIZARD_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>راه‌اندازی Wakee | Setup Wizard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-3xl w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 class="text-3xl font-bold text-blue-400 mb-2 text-center">⚡ جادوگر راه‌اندازی Wakee</h1>
        <p class="text-center text-slate-400 mb-8 text-sm">به دلیل محدودیت‌های امنیتی مرورگر (CORS)، پیکربندی نهایی نیازمند ۳ اقدام ساده در پنل کلادفلر است. این مراحل کمتر از ۱ دقیقه زمان می‌برد.</p>

        <div class="space-y-6">
            <!-- Step 1: Discord Info -->
            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-blue-500">
                <h3 class="font-bold text-lg mb-3 text-blue-300">۱. تنظیمات دیسکورد</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div><span class="text-slate-500">Name:</span> <code class="bg-slate-700 px-2 py-1 rounded text-white">Wakee</code></div>
                    <div><span class="text-slate-500">Description:</span> <code class="bg-slate-700 px-2 py-1 rounded text-white text-xs">Smart management and wake-up bot for Render services.</code></div>
                    <div class="md:col-span-2"><span class="text-slate-500">Terms/Privacy URL:</span> <code class="bg-slate-700 px-2 py-1 rounded text-white text-xs break-all">https://h4m1dr.github.io/wakeup/terms.html</code></div>
                    <div class="md:col-span-2"><span class="text-slate-500">Interactions Endpoint:</span> <code id="workerUrl" class="bg-slate-700 px-2 py-1 rounded text-green-400 text-xs break-all">در حال دریافت...</code></div>
                </div>
                <p class="text-xs text-yellow-400">⚠️ در بخش <strong>Bot</strong> دیسکورد، گزینه‌های Presence, Server Members, و Message Content Intent را روشن کنید.</p>
            </div>

            <!-- Step 2: Cloudflare KV -->
            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-yellow-500">
                <h3 class="font-bold text-lg mb-3 text-yellow-300">۲. ساخت فضای ذخیره‌سازی (KV)</h3>
                <ol class="list-decimal list-inside text-sm text-slate-300 space-y-2">
                    <li>به <a href="https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces" target="_blank" class="text-blue-400 underline font-bold">صفحه ساخت KV کلادفلر</a> بروید.</li>
                    <li>روی <strong>Create a namespace</strong> کلیک کنید.</li>
                    <li>نام آن را دقیقاً <code class="bg-slate-700 px-1 rounded text-white">WAKEE_KV</code> بگذارید و Add را بزنید.</li>
                </ol>
            </div>

            <!-- Step 3: Secrets -->
            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-green-500">
                <h3 class="font-bold text-lg mb-3 text-green-300">۳. وارد کردن توکن‌ها (Secrets)</h3>
                <ol class="list-decimal list-inside text-sm text-slate-300 space-y-2">
                    <li>به صفحه ورکر خود در کلادفلر بروید: <a href="https://dash.cloudflare.com/?to=/:account/workers/services/view/wakee-bot/production/settings/bindings" target="_blank" class="text-blue-400 underline font-bold">مدیریت Bindings ورکر</a></li>
                    <li>در بخش <strong>Variables</strong>، روی <strong>Add variable</strong> کلیک کنید:</li>
                    <ul class="list-disc list-inside mr-6 text-xs text-slate-400 mt-1 space-y-1">
                        <li>Variable name: <code class="text-white">ADMIN_PASSWORD</code> | Value: <span class="text-yellow-300">(رمز دلخواه خود را اینجا بنویسید و به خاطر بسپارید)</span></li>
                        <li>Variable name: <code class="text-white">DISCORD_TOKEN</code> | Value: <span class="text-yellow-300">(توکن ربات دیسکورد خود را اینجا پیست کنید)</span></li>
                    </ul>
                    <li>در بخش <strong>KV Namespace Bindings</strong>، روی <strong>Add binding</strong> کلیک کنید: Variable name را <code class="text-white">WAKEE_KV</code> و KV Namespace را همان چیزی که در مرحله ۲ ساختید انتخاب کنید.</li>
                    <li>روی دکمه <strong>Save and Deploy</strong> در بالای صفحه کلادفلر کلیک کنید.</li>
                </ol>
            </div>

            <!-- Step 4: Final Code -->
            <div class="bg-slate-900 p-5 rounded-lg border-r-4 border-purple-500">
                <h3 class="font-bold text-lg mb-3 text-purple-300">۴. جایگذاری کد نهایی</h3>
                <ol class="list-decimal list-inside text-sm text-slate-300 space-y-2">
                    <li>به تب <strong>Quick Edit</strong> در صفحه ورکر کلادفلر خود بروید.</li>
                    <li>تمام کدهای موجود را پاک کنید.</li>
                    <li>کد کامل را از <a href="https://raw.githubusercontent.com/h4m1dr/wakeup/main/full_worker.js" target="_blank" class="text-blue-400 underline font-bold">این لینک (full_worker.js)</a> کپی کرده و آنجا پیست کنید.</li>
                    <li>دوباره <strong>Save and Deploy</strong> را بزنید.</li>
                </ol>
            </div>

            <!-- Action Button -->
            <button onclick="finishSetup()" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition duration-200 text-lg shadow-lg mt-4">
                ✅ تمام مراحل بالا را انجام دادم، ورود به پنل مدیریت
            </button>
        </div>
    </div>

    <script>
        document.getElementById('workerUrl').innerText = window.location.origin;

        function finishSetup() {
            // هدایت مستقیم به پنل. اگر مراحل بالا درست انجام شده باشد، 
            // ورکر اکنون کد کامل را دارد و با رمز عبور کار می‌کند.
            window.location.href = '/login';
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request) {
    return new Response(WIZARD_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
};

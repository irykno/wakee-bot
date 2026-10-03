// Wakee Bot - Debug Version

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Debug endpoint
    if (url.pathname === "/debug") {
      return new Response(JSON.stringify({
        hasAdminPassword: !!env.ADMIN_PASSWORD,
        passwordLength: env.ADMIN_PASSWORD ? env.ADMIN_PASSWORD.length : 0,
        kvBound: !!env.WAKEE_KV,
        timestamp: new Date().toISOString()
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    if (method === "POST") {
      return handleDiscord(request, env);
    }

    if (url.pathname === "/login") {
      return new Response(getLoginHTML(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname === "/panel") {
      const cookie = request.headers.get("Cookie") || "";
      if (!cookie.includes("wakee_auth=true")) {
        return Response.redirect(`${url.origin}/login`, 302);
      }
      return new Response(getPanelHTML(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return Response.redirect(`${url.origin}/login`, 302);
  },

  async scheduled(event, env, ctx) {
    const services = JSON.parse(await env.WAKEE_KV.get("render_services") || "[]");
    for (const svc of services) {
      if (svc.active) {
        ctx.waitUntil(
          fetch(svc.url, { method: "GET" })
            .then(res => console.log(`[CRON] Pinged ${svc.name}: ${res.status}`))
            .catch(err => console.error(`[CRON] Failed ${svc.name}:`, err))
        );
      }
    }
  }
};

async function handleApi(request, env, url) {
  const cookie = request.headers.get("Cookie") || "";
  
  if (url.pathname === "/api/login" && request.method === "POST") {
    try {
      const data = await request.json();
      const inputPass = String(data.password || "").trim();
      const storedPass = String(env.ADMIN_PASSWORD || "").trim();
      
      console.log(`Login attempt: input length=${inputPass.length}, stored length=${storedPass.length}`);
      
      if (inputPass && storedPass && inputPass === storedPass) {
        return new Response(JSON.stringify({ success: true }), { 
          headers: { 
            "Content-Type": "application/json", 
            "Set-Cookie": "wakee_auth=true; Path=/; Max-Age=86400; Secure; SameSite=Lax" 
          } 
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Password mismatch",
        debug: {
          inputLength: inputPass.length,
          storedLength: storedPass.length,
          hasStored: !!storedPass
        }
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" } 
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      });
    }
  }

  if (!cookie.includes("wakee_auth=true")) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (url.pathname === "/api/services" && request.method === "GET") {
    return new Response(await env.WAKEE_KV.get("render_services") || "[]", { headers: { "Content-Type": "application/json" } });
  }

  if (url.pathname === "/api/services" && request.method === "POST") {
    const data = await request.json();
    await env.WAKEE_KV.put("render_services", JSON.stringify(data.services));
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }

  if (url.pathname === "/api/discord_token" && request.method === "POST") {
    const data = await request.json();
    await env.WAKEE_KV.put("discord_token", data.token);
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response("Not Found", { status: 404 });
}

async function handleDiscord(request, env) {
  const bodyText = await request.text();
  let interaction;
  try { interaction = JSON.parse(bodyText); } catch (e) { return new Response("Invalid JSON", { status: 400 }); }

  if (interaction.type === 1) return Response.json({ type: 1 });

  if (interaction.type === 3 && interaction.data.custom_id === "wake_all") {
    const services = JSON.parse(await env.WAKEE_KV.get("render_services") || "[]");
    let results = [];
    for (const svc of services) {
      try {
        const res = await fetch(svc.url, { method: "GET" });
        results.push(`✅ ${svc.name}: ${res.status}`);
      } catch (e) {
        results.push(`❌ ${svc.name}: Failed`);
      }
    }
    return Response.json({
      type: 4,
      data: { content: ` وضعیت بیدارباش:\n${results.join("\n") || "هیچ سرویسی تعریف نشده است."}`, flags: 64 }
    });
  }

  if (interaction.type === 2) {
    return Response.json({
      type: 4,
      data: {
        content: "🎛 **پنل کنترل Wakee**\nبرای بیدار کردن تمام سرویس‌های تعریف‌شده در پنل، روی دکمه زیر کلیک کنید:",
        components: [{
          type: 1,
          components: [{ type: 2, style: 3, label: "🚀 بیدار کردن همه سرویس‌ها", custom_id: "wake_all" }]
        }]
      }
    });
  }
  return new Response("OK", { status: 200 });
}

function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | Wakee</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
    <h1 class="text-2xl font-bold text-blue-400 mb-6 text-center"> ورود به پنل مدیریت</h1>
    
    <div id="debugInfo" class="bg-slate-900 p-3 rounded mb-4 text-xs text-slate-400"></div>
    
    <input type="password" id="loginPass" class="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="رمز عبور مدیریتی...">
    <button onclick="doLogin()" id="loginBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">ورود</button>
    <p id="error" class="text-red-400 text-sm mt-3 text-center hidden"></p>
  </div>
  <script>
    // Check debug info on load
    fetch('/debug')
      .then(r => r.json())
      .then(data => {
        document.getElementById('debugInfo').innerHTML = 
          'Status: ' + (data.hasAdminPassword ? '✅ Password set' : '❌ No password') + 
          '<br>Length: ' + data.passwordLength + 
          '<br>KV: ' + (data.kvBound ? '✅ Connected' : '❌ Not connected');
      });

    async function doLogin() {
      const pass = document.getElementById('loginPass').value;
      const btn = document.getElementById('loginBtn');
      const errorDiv = document.getElementById('error');
      
      btn.disabled = true;
      btn.innerText = 'در حال بررسی...';
      errorDiv.classList.add('hidden');
      
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        
        const data = await res.json();
        
        if (data.success) {
          btn.innerText = '✅ موفقیت! در حال انتقال...';
          setTimeout(() => { window.location.href = '/panel'; }, 1000);
        } else {
          errorDiv.innerText = 'خطا: ' + (data.error || 'رمز عبور اشتباه است');
          if (data.debug) {
            errorDiv.innerHTML += '<br><small>Debug: ' + JSON.stringify(data.debug) + '</small>';
          }
          errorDiv.classList.remove('hidden');
          btn.disabled = false;
          btn.innerText = 'ورود';
        }
      } catch (e) {
        errorDiv.innerText = 'خطای ارتباطی: ' + e.message;
        errorDiv.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = 'ورود';
      }
    }
  </script>
</body>
</html>`;
}

function getPanelHTML() {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | Wakee</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8">
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-blue-400">⚡ داشبورد مدیریت Wakee</h1>
      <button onclick="window.location.href='/login'" class="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded">خروج</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 md:col-span-2">
        <h3 class="text-lg font-semibold mb-2 text-green-400">مدیریت سرویس‌های رندر</h3>
        <p class="text-sm text-slate-400 mb-4">آدرس‌های رندر خود را اضافه کنید تا ربات آن‌ها را بیدار نگه دارد.</p>
        <div id="serviceList" class="space-y-2 mb-4 max-h-60 overflow-y-auto"></div>
        <div class="flex gap-2">
          <input type="text" id="newServiceName" placeholder="نام (مثلاً Hermes)" class="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-sm">
          <input type="text" id="newServiceUrl" placeholder="https://..." class="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-sm">
          <button onclick="addService()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">+</button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 text-purple-400">تنظیمات دیسکورد</h3>
          <p class="text-xs text-slate-400 mb-3">توکن ربات دیسکورد خود را اینجا وارد کنید.</p>
          <input type="password" id="discordTokenInput" placeholder="Discord Bot Token" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm mb-3">
          <button onclick="saveDiscordToken()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm w-full">ذخیره توکن دیسکورد</button>
        </div>

        <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 class="text-lg font-semibold mb-2 text-yellow-400">📋 لاگ‌های سیستم</h3>
          <div class="bg-slate-950 rounded p-4 font-mono text-xs h-40 overflow-y-auto text-green-300" id="logBox">
            [System] پنل با موفقیت بارگذاری شد.
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let services = [];
    async function loadServices() {
      const res = await fetch('/api/services');
      services = await res.json();
      renderServices();
    }
    function renderServices() {
      const list = document.getElementById('serviceList');
      list.innerHTML = '';
      services.forEach((svc, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-slate-700 p-2 rounded text-sm';
        div.innerHTML = '<div><span class="font-bold text-blue-300">' + svc.name + '</span><span class="text-slate-400 text-xs block">' + svc.url + '</span></div><button onclick="removeService(' + index + ')" class="text-red-400 hover:text-red-300 px-2">🗑</button>';
        list.appendChild(div);
      });
    }
    async function addService() {
      const name = document.getElementById('newServiceName').value;
      const url = document.getElementById('newServiceUrl').value;
      if (!name || !url) return alert('نام و آدرس را وارد کنید');
      services.push({ name, url, active: true });
      await saveServices();
      document.getElementById('newServiceName').value = '';
      document.getElementById('newServiceUrl').value = '';
    }
    async function removeService(index) {
      services.splice(index, 1);
      await saveServices();
    }
    async function saveServices() {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      });
      renderServices();
      document.getElementById('logBox').innerHTML += '<br>[Action] لیست سرویس‌ها به‌روزرسانی شد.';
    }
    
    async function saveDiscordToken() {
      const token = document.getElementById('discordTokenInput').value;
      if(!token) return alert('توکن را وارد کنید');
      await fetch('/api/discord_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      alert('توکن دیسکورد با موفقیت ذخیره شد!');
      document.getElementById('discordTokenInput').value = '';
      document.getElementById('logBox').innerHTML += '<br>[Action] توکن دیسکورد به‌روزرسانی شد.';
    }

    loadServices();
  </script>
</body>
</html>`;
}

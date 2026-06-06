export default {
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("ok");
    }

    try {
      const update = await req.json();

      console.log("UPDATE:", update);

      return new Response("ok");
    } catch (e) {
      return new Response("error");
    }
  }
}

    // =========================
    // TELEGRAM WEBHOOK
    // =========================
    if (url.pathname === "/webhook" && request.method === "POST") {
      const update = await request.json()

      const msg = update.message
      if (!msg) return new Response("ok")

      const chatId = msg.chat.id
      const userId = msg.from.id
      const text = msg.text || ""

      let user = await getUser(env, userId)

      if (!user) {
        user = {
          xp: 0,
          name: msg.from.first_name,
          admin: false
        }
      }

      // =========================
      // START
      // =========================
      if (text === "/start") {
        await saveUser(env, userId, user)

        return send(env, chatId,
`👋 Добро пожаловать!

Команды:
/profile - профиль
/game - мини игра
/ai текст - ответ`)
      }

      // =========================
      // PROFILE
      // =========================
      if (text === "/profile") {
        return send(env, chatId,
`👤 PROFILE

Name: ${user.name}
XP: ${user.xp}
Admin: ${user.admin ? "YES 👑" : "NO"}`)
      }

      // =========================
      // MINI GAME
      // =========================
      if (text === "/game") {
        user.secret = Math.floor(Math.random() * 5) + 1
        await saveUser(env, userId, user)

        return send(env, chatId, "🎮 Угадай число (1-5)")
      }

      if (["1","2","3","4","5"].includes(text)) {
        if (user.secret == text) {
          user.xp += 10
          await saveUser(env, userId, user)

          return send(env, chatId, "🎉 +10 XP")
        } else {
          return send(env, chatId, "❌ неверно")
        }
      }

      // =========================
      // AUTO ADMIN
      // =========================
      if (user.xp >= 1000 && !user.admin) {
        user.admin = true
        await saveUser(env, userId, user)

        return send(env, chatId, "👑 ТЫ ПОЛУЧИЛ АДМИНКУ!")
      }

      await saveUser(env, userId, user)

      return new Response("ok")
    }

    return new Response("not found")
  }
}

// =========================
// TELEGRAM SEND
// =========================
async function send(env, chatId, text) {
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  })
}

// =========================
// KV GET
// =========================
async function getUser(env, id) {
  const data = await env.DB.get(id.toString())
  return data ? JSON.parse(data) : null
}

// =========================
// KV SAVE
// =========================
async function saveUser(env, id, user) {
  await env.DB.put(id.toString(), JSON.stringify(user))
}

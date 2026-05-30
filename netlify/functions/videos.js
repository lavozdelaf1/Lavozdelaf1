const { getStore } = require("@netlify/blobs");

const PASSWORD = "Alvaro44!";
const STORE_KEY = "videos";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const store = getStore("asm-videos");

  if (event.httpMethod === "GET") {
    try {
      const data = await store.get(STORE_KEY);
      const videos = data ? JSON.parse(data) : [];
      return { statusCode: 200, headers, body: JSON.stringify(videos) };
    } catch (e) {
      return { statusCode: 200, headers, body: JSON.stringify([]) };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);

      if (body.action === "check") {
        if (body.password === PASSWORD) {
          return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
        } else {
          return { statusCode: 401, headers, body: JSON.stringify({ error: "Contraseña incorrecta" }) };
        }
      }

      if (body.password !== PASSWORD) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "Contraseña incorrecta" }) };
      }

      const data = await store.get(STORE_KEY);
      let videos = data ? JSON.parse(data) : [];

      if (body.action === "add") {
        videos.unshift({ title: body.title, platform: body.platform, url: body.url, date: body.date || "Reciente", thumb: body.thumb || "" });
        if (videos.length > 6) videos = videos.slice(0, 6);
        await store.set(STORE_KEY, JSON.stringify(videos));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, videos }) };
      }

      if (body.action === "delete") {
        videos.splice(body.index, 1);
        await store.set(STORE_KEY, JSON.stringify(videos));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, videos }) };
      }

    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};

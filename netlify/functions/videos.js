const PASSWORD = "Alvaro44!";
const AIRTABLE_TOKEN = "pat4KtRJm3Rb2Okuh.7969d5593ab40284baaaa29b3cff4b9b6688b0a8840abbb216f2b573b11f04db";
const BASE_ID = "appkIpcnX2PtgJRb1";
const TABLE_ID = "tbl9IkS4hcq72wVFK";
const API_URL = "https://api.airtable.com/v0/" + BASE_ID + "/" + TABLE_ID;

const HEADERS = {
  "Authorization": "Bearer " + AIRTABLE_TOKEN,
  "Content-Type": "application/json"
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

async function getVideos() {
  const r = await fetch(API_URL + "?maxRecords=6", { headers: HEADERS });
  const data = await r.json();
  if (!r.ok) throw new Error("Airtable GET error: " + JSON.stringify(data));
  return (data.records || []).map(function(rec) {
    return {
      id: rec.id,
      title: rec.fields.title || "",
      platform: rec.fields.platform || "",
      url: rec.fields.url || "",
      date: rec.fields.date || "",
      thumb: rec.fields.thumb || ""
    };
  });
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod === "GET") {
    try {
      const videos = await getVideos();
      return { statusCode: 200, headers: CORS, body: JSON.stringify(videos) };
    } catch(e) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify([]) };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);

      if (body.password !== PASSWORD) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Contrasena incorrecta" }) };
      }

      if (body.action === "add") {
        const payload = {
          records: [{
            fields: {
              title: body.title,
              platform: body.platform,
              url: body.url,
              date: body.date || "Reciente",
              thumb: body.thumb || ""
            }
          }]
        };

        const r = await fetch(API_URL, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(payload)
        });

        const result = await r.json();

        if (!r.ok) {
          return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: "Airtable error: " + JSON.stringify(result) }) };
        }

        const videos = await getVideos();
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, videos: videos }) };
      }

      if (body.action === "delete") {
        const r = await fetch(API_URL + "/" + body.id, {
          method: "DELETE",
          headers: HEADERS
        });
        if (!r.ok) {
          return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: "Delete failed" }) };
        }
        const videos = await getVideos();
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, videos: videos }) };
      }

    } catch(e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
};

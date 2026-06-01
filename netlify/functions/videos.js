const PASSWORD = "Alvaro44!";
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = "appkIpcnX2PtgJRb1";
const TABLE_ID = "tbl9IkS4hcq72wVFK";
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

const headers_air = {
  "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json"
};

const headers_res = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headers_res, body: "" };
  }

  // GET - traer videos
  if (event.httpMethod === "GET") {
    try {
      const res = await fetch(`${API_URL}?maxRecords=6`, { headers: headers_air });
      const data = await res.json();
      const videos = (data.records || []).map(r => ({
        id: r.id,
        title: r.fields.title || "",
        platform: r.fields.platform || "",
        url: r.fields.url || "",
        date: r.fields.date || "",
        thumb: r.fields.thumb || ""
      }));
      return { statusCode: 200, headers: headers_res, body: JSON.stringify(videos) };
    } catch (e) {
      return { statusCode: 200, headers: headers_res, body: JSON.stringify([]) };
    }
  }

  // POST
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);

      if (body.password !== PASSWORD) {
        return { statusCode: 401, headers: headers_res, body: JSON.stringify({ error: "Contrasena incorrecta" }) };
      }

      // Agregar video
      if (body.action === "add") {
        await fetch(API_URL, {
          method: "POST",
          headers: headers_air,
          body: JSON.stringify({
            records: [{
              fields: {
                title: body.title,
                platform: body.platform,
                url: body.url,
                date: body.date || "Reciente",
                thumb: body.thumb || ""
              }
            }]
          })
        });

        const newRes = await fetch(`${API_URL}?maxRecords=6`, { headers: headers_air });
        const newData = await newRes.json();
        const videos = (newData.records || []).map(r => ({
          id: r.id,
          title: r.fields.title || "",
          platform: r.fields.platform || "",
          url: r.fields.url || "",
          date: r.fields.date || "",
          thumb: r.fields.thumb || ""
        }));
        return { statusCode: 200, headers: headers_res, body: JSON.stringify({ ok: true, videos }) };
      }

      // Borrar video
      if (body.action === "delete") {
        await fetch(`${API_URL}/${body.id}`, {
          method: "DELETE",
          headers: headers_air
        });
        const newRes = await fetch(`${API_URL}?maxRecords=6`, { headers: headers_air });
        const newData = await newRes.json();
        const videos = (newData.records || []).map(r => ({
          id: r.id,
          title: r.fields.title || "",
          platform: r.fields.platform || "",
          url: r.fields.url || "",
          date: r.fields.date || "",
          thumb: r.fields.thumb || ""
        }));
        return { statusCode: 200, headers: headers_res, body: JSON.stringify({ ok: true, videos }) };
      }

    } catch (e) {
      return { statusCode: 500, headers: headers_res, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers: headers_res, body: JSON.stringify({ error: "Method not allowed" }) };
};

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { calculate } = require("./lib/estimate");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
function json(res, status, body) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(body)); }
function readBody(req) { return new Promise((resolve, reject) => { let raw = ""; req.on("data", chunk => { raw += chunk; if (raw.length > 8192) { reject(new Error("Request too large")); req.destroy(); } }); req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { reject(new Error("Invalid JSON")); } }); req.on("error", reject); }); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok" });
  if (url.pathname === "/api/predict") {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return json(res, 405, { error: "Method not allowed." }); }
    let input; try { input = await readBody(req); } catch (error) { return json(res, 400, { error: error.message }); }
    const result = calculate(input);
    if (!result.ok) return json(res, 400, { error: "Please check the estimate values.", fields: result.fields });
    return json(res, 200, result);
  }
  if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "Method not allowed." });
  let fileName;
  try { fileName = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1)); }
  catch { return json(res, 400, { error: "Invalid path." }); }
  if (!["index.html", "script.js", "style.css"].includes(fileName)) return json(res, 404, { error: "Not found." });
  try { const body = await fs.promises.readFile(path.join(ROOT, fileName)); res.writeHead(200, { "Content-Type": MIME[path.extname(fileName)], "X-Content-Type-Options": "nosniff" }); res.end(req.method === "HEAD" ? undefined : body); }
  catch { json(res, 404, { error: "Not found." }); }
});
server.listen(PORT, HOST, () => console.log("LoanPredict demo running at http://" + HOST + ":" + PORT));

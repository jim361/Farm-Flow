const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "frontend", "dist");
const toolsDir = path.join(rootDir, "tools");
const backendOrigin = process.env.FARMFLOW_BACKEND_ORIGIN || "http://127.0.0.1:8080";
const mqttHost = process.env.FARMFLOW_MQTT_WS_HOST || "127.0.0.1";
const mqttPort = Number(process.env.FARMFLOW_MQTT_WS_PORT || 9001);
const port = Number(process.env.FARMFLOW_PUBLIC_PORT || 8787);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function log(message) {
  console.log(`${new Date().toISOString()} ${message}`);
}

function resolveInside(base, requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split("?")[0]);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(base, safePath);
  return fullPath.startsWith(base) ? fullPath : null;
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/tools/")) {
    const filePath = resolveInside(toolsDir, url.pathname.replace(/^\/tools\//, "/"));
    if (!filePath) {
      send(res, 403, "Forbidden");
      return;
    }
    serveFile(res, filePath);
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = resolveInside(distDir, requested);
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return;
  }

  serveFile(res, path.join(distDir, "index.html"));
}

function proxyApi(req, res) {
  const target = new URL(req.url, backendOrigin);
  const headers = {
    ...req.headers,
    host: target.host,
  };
  delete headers.origin;

  log(`${req.method} ${req.url} -> ${target.href}`);
  const proxyReq = http.request(
    target,
    {
      method: req.method,
      headers,
    },
    (proxyRes) => {
      log(`${req.method} ${req.url} <- ${proxyRes.statusCode || 502}`);
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (err) => {
    log(`${req.method} ${req.url} proxy error: ${err.message}`);
    send(res, 502, `Backend proxy error: ${err.message}`, { "Content-Type": "text/plain; charset=utf-8" });
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url === "/__health") {
    send(res, 200, JSON.stringify({ ok: true, service: "farmflow-public", backendOrigin }), {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return;
  }

  if (req.url && req.url.startsWith("/api/")) {
    proxyApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (!req.url || !req.url.startsWith("/mqtt")) {
    socket.destroy();
    return;
  }

  const upstream = net.connect(mqttPort, mqttHost, () => {
    const requestLine = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    const headers = Object.entries(req.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");
    upstream.write(`${requestLine}${headers}\r\n\r\n`);
    if (head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });

  upstream.on("error", () => socket.destroy());
});

server.listen(port, "127.0.0.1", () => {
  log(`FarmFlow public server: http://127.0.0.1:${port}`);
  log(`API proxy: /api/* -> ${backendOrigin}/api/*`);
  log(`MQTT WebSocket proxy: /mqtt -> ${mqttHost}:${mqttPort}`);
});

const http = require("node:http");
const { URL } = require("node:url");
const products = require("./routes/products");

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const MAX_BODY_BYTES = 1024 * 1024;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        const error = new Error("Request body exceeds the 1MB limit");
        error.statusCode = 400;
        req.pause();
        reject(error);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function parseJsonBody(req) {
  const raw = await readBody(req);
  if (raw.trim() === "") {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    const error = new Error("Malformed JSON in request body");
    error.statusCode = 400;
    throw error;
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  const method = req.method || "GET";

  if (method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  if (segments[0] === "api" && segments[1] === "products") {
    if (segments.length === 2 && method === "GET") {
      return sendJson(res, 200, { status: "success", data: products.list() });
    }

    if (segments.length === 2 && method === "POST") {
      const body = await parseJsonBody(req);
      const result = products.validate(body);
      if (!result.ok) {
        return sendJson(res, 400, { status: "error", message: result.message });
      }
      const created = products.create(body);
      return sendJson(res, 201, { status: "success", data: created });
    }

    if (segments.length === 3 && method === "GET") {
      const product = products.getById(segments[2]);
      if (!product) {
        return sendJson(res, 404, {
          status: "error",
          message: "Product not found: " + segments[2],
        });
      }
      return sendJson(res, 200, { status: "success", data: product });
    }
  }

  return sendJson(res, 404, {
    status: "error",
    message: "Route not found: " + method + " " + req.url,
  });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : "Internal server error";
    sendJson(res, statusCode, { status: "error", message });
  });
});

server.listen(port, host, () => {
  console.log("my-api-app listening on http://" + host + ":" + port);
});

function shutdown(signal) {
  console.log(signal + " received, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

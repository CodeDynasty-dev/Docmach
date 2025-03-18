#!/usr/bin/env node

/*!
 * Caron dimonio, con occhi di bragia
 * loro accennando, tutte le raccoglie;
 * batte col remo qualunque s’adagia
 *
 * Charon the demon, with the eyes of glede,
 * Beckoning to them, collects them all together,
 * Beats with his oar whoever lags behind
 *
 *          Dante - The Divine Comedy (Canto III)
 */

import http from "http";
import { cp, mkdir, open, readFile, rm,  stat } from "node:fs/promises";
import path from "path";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import { parseCredenceFIles } from "./parser.js";
import { cwd } from "process";
import Mime from "mime/lite";
import { createReadStream } from "node:fs";
import { exec } from "child_process";
import net from "net";

 async function findAvailablePort(port = 4000) {
  while (await isPortInUse(port)) port++;
  return port;
}
function isPortInUse(port: number) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Define the path to your package.json file
const packageJsonPath = path.join(cwd(), "package.json");
 
const root = path.resolve(process.argv[3] || process.cwd());
let config = {
  "docs-directory": root,
  "build-directory": "./credence-build",
  "default-template": "",
  "assets-folder": "",
  root,
};

try {
  const data = await readFile(packageJsonPath, "utf8");
  const p = JSON.parse(data);
  const credenceConfig = p.credence;
  if (credenceConfig) {
    config = Object.assign(config, credenceConfig);
  } else {
    console.warn("No credence configuration found in package.json.");
  }
} catch (_e) {
  console.error("Error reading package.json:", _e);
}

// Get command-line arguments: port and root directory.

// Live-reload client script to inject into HTML pages.
const liveReloadScript = `
<script>
  (function() {
    var protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var address = protocol + location.host;
  const connect = ()=> {
    var socket = new WebSocket(address);
    socket.onmessage = function(msg) {
      if (msg.data === 'reload') {
        window.location.reload();
        }
    };
    return socket;
    };
 const socket = connect();
    socket.onclose = function() {
       console.warn("Live reload connection lost. Attempting to reconnect...");
       window.location.reload();
     };
  })();
</script>
`;

function logHttpError(
  method: string,
  url: string,
  statusCode: number,
  message: string,
  error?: any,
): void {
  const errorLog = {
    method,
    url,
    statusCode,
    message,
    error,
  };

  console.error(
    `[${errorLog.method} ${errorLog.url} - ${errorLog.statusCode}: ${errorLog.message}`,
  );
  if (errorLog.error) {
    console.error("Error Details:", String(errorLog.error));
  }
}

// Create an HTTP server.
const server = http.createServer(async (req, res) => {
  // Resolve file path relative to the root directory.
  let filePath = path.join(cwd(), config["build-directory"], req.url!);
  // If the URL ends with '/' serve index.html
  if (req.url?.endsWith("/")) {
    filePath = path.join(filePath, "/index.html");
  }
  // console.log(req.url, filePath);
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }
    let content = await readFile(filePath, "utf8");
    const ext = path.extname(filePath).toLowerCase();
    const contentType = Mime.getType(ext) ?? "application/octet-stream";
    if (ext === ".html" || ext === ".htm") {
      if (content.includes("</body>")) {
        content = content.replace("</body>", `${liveReloadScript}</body>`);
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
      return;
    }
    const stream = createReadStream(filePath, { autoClose: true });
    res.writeHead(200, { "Content-Type": contentType });
    stream.pipe(res);
  } catch (error) {
    logHttpError(req.method!, req.url!, 500, "Server Error");
    res.writeHead(500, { "Content-Type": "text/plain" });
    return res.end("500 Server Error");
  }
});

await rm(path.resolve(cwd(), config["build-directory"]), { recursive: true })
  .catch((_e) => {});
await mkdir(config["build-directory"]).catch((_e) => {});
const port = await findAvailablePort();
// Start the HTTP server.
server.listen(port, () => {
  console.log(`Credence compiling at http://localhost:${port}`);
});

// Set up WebSocket server on the same HTTP server.
const wss = new WebSocketServer({ server });
function broadcastReload() {
  wss.clients.forEach(
    (client: { readyState: number; send: (arg0: string) => void }) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    },
  );
}

const getCSSCommand = async () => {
  try {
    if (await open("./tailwind.config.js")) {
      return `npx tailwindcss -c tailwind.config.js -o ${
        path.join(config["build-directory"], "/bundle.css")
      }`;
    }
    if (await open("./postcss.config.js")) {
      return `npx postcss ${
        path.join(config["docs-directory"], "/styles.css")
      } -o ${path.join(config["build-directory"], "/bundle.css")}`;
    }
  } catch (error) {
  }
  return "";
};

const css_command = await getCSSCommand();
function buildCSS() {
  if (!css_command) return;
  return new Promise((resolve, reject) => {
    exec(css_command, (err, _stdout, _stderr) => {
      if (err) {
        reject("CSS compilation error:" + String(err));
      } else {
        resolve(undefined);
      }
    });
  });
}

const onFileChange = async (file: string) => {
  if (config["assets-folder"] && await open(config["assets-folder"])) {
    const sourceDir = path.join(cwd(), config["assets-folder"]);
    const destinationDir = path.join(cwd(), config["build-directory"]);
    await cp(sourceDir, destinationDir, {
      recursive: true,
      force: true,
      preserveTimestamps: true,
    });
  }
  const ran = await parseCredenceFIles(config, file);
  broadcastReload();
  if (!ran) return;
  await buildCSS();
  broadcastReload();
};

await parseCredenceFIles(config);
await buildCSS();

chokidar.watch(config["docs-directory"], {
  ignoreInitial: true,
}).on(
  "all",
  async (_, file) => {
    try {
      if (
        (path.join(cwd(), file)).includes(
          path.resolve(cwd(), config["build-directory"]) + "/",
        ) &&
        Boolean(await open(path.join(cwd(), file)))
      ) return;
    } catch {}
    onFileChange(file);
  },
);

console.log("Watching for changes...");

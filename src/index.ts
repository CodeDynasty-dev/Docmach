#!/usr/bin/env node

import http from "http";
import { exists, mkdir, open, readFile, rmdir, stat } from "node:fs/promises";
import path from "path";
import WebSocket from "ws";
import chokidar from "chokidar";
import { parseCredenceFIles } from "./parser.ts";
import { cwd } from "process";
import Mime from "mime/lite";
import { createReadStream } from "node:fs";
import { exec } from "child_process";

// Define the path to your package.json file
const packageJsonPath = path.join(cwd(), "package.json");

const port = process.argv[2] || 8080;
const root = path.resolve(process.argv[3] || process.cwd());
let config = {
  "input_directory": root,
  "output_directory": "./dist",
  "base_html_file": "",
  "root_element_ID": "app",
  "assets_to_copy": "",
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
  const connect = ()=> {
    var protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var address = protocol + location.host;
    var socket = new WebSocket(address);
    socket.onmessage = function(msg) {
      if (msg.data === 'reload') {
        window.location.reload();
        }
    };
     socket.onclose = function() {
        console.warn("Live reload connection lost. Attempting to reconnect...");
      setTimeout(connect, 3000);
      };
  };
  connect();
  })();
</script>
`;

// Create an HTTP server.
const server = http.createServer(async (req, res) => {
  // Resolve file path relative to the root directory.
  let filePath = path.join(cwd(), config.output_directory, req.url!);
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
    console.log(String(error));

    res.writeHead(500, { "Content-Type": "text/plain" });
    return res.end("500 Server Error");
  }
});

await rmdir(path.resolve(cwd(), config.output_directory), { recursive: true })
  .catch((_e) => {});
await mkdir(config.output_directory).catch((_e) => {});

// Start the HTTP server.
server.listen(port, () => {
  console.log(`Credence compiling at http://localhost:${port}`);
});

// Set up WebSocket server on the same HTTP server.
// @ts-expect-error
const wss = new WebSocket.Server({ server });
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
  if (await exists("./tailwind.config.js")) {
    return `npx tailwindcss -c tailwind.config.js -o ${
      path.join(config.output_directory, "/bundle.css")
    }`;
  }
  if (await exists("./postcss.config.js")) {
    return `npx postcss ${
      path.join(config.input_directory, "/styles.css")
    } -o ${path.join(config.output_directory, "/bundle.css")}`;
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
  const ran = await parseCredenceFIles(config, file);
  broadcastReload();
  if (!ran) return;
  await buildCSS();
  broadcastReload();
};

await parseCredenceFIles(config);
await buildCSS();

chokidar.watch(config.input_directory, {
  ignoreInitial: true,
}).on(
  "all",
  async (_, file) => {
    try { 
      if (
        (path.join(cwd(), file)).includes(path.resolve(cwd(), config.output_directory)+"/") &&
        Boolean(await open(path.join(cwd(), file)))
      ) return;
    } catch {}
    onFileChange(file);
  },
);

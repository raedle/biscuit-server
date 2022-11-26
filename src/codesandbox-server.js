const express = require("express");
const babel = require("@babel/core");
const fs = require("fs");
const QRCode = require("qrcode");
const http = require("http");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const chokidar = require("chokidar");
const url = require("url");

module.exports.start = function (options = { entryFile: 'App.jsx', port: 8080, watchDir: "." }) {
  const { entryFile, port, watchDir } = options;
  const app = express();
  const httpServer = http.createServer(app);
  const wss = new WebSocket.Server({ server: httpServer });

  function getSandboxUrl() {
    return process.env.SANDBOX_URL;
  }

  function getBiscuitUrl() {
    const sandboxUrl = getSandboxUrl();
    const parsedUrl = url.parse(sandboxUrl);
    const protocol = "biscuit:";
    parsedUrl.protocol = protocol;
    parsedUrl.href = parsedUrl.href.replace(/^[^:]+:/, protocol);
    return parsedUrl.href;
  }
  //
  function updateCode(ws) {
    console.debug("updateCode");
    const buffer = fs.readFileSync(entryFile);
    const { code } = babel.transformSync(buffer.toString(), {
      presets: ["@babel/preset-env", "@babel/preset-react"]
    });
    const message = JSON.stringify({
      type: "code",
      code
    });
    ws.send(message);
  }

  app.use(bodyParser.json());

  app.get("/", function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(`
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" integrity="sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  </head>
  <body>
    <div id="qrcode"></div>
    <div>${getBiscuitUrl()}</div>
    <script type="text/javascript">
    new QRCode(document.getElementById("qrcode"), "${getBiscuitUrl()}");
    </script>
  </body>
</html>`);
    res.end();
  });

  app.get("/info", function (req, res) {
    console.log(req);
  });

  const sockets = [];

  function onClientJoin(ws, req) {
    sockets.push(ws);
    console.log(
      `[+] New client (${req.socket.remoteAddress}) (num clients = ${sockets.length})`
    );
  }

  function onClientLeave(ws) {
    const idx = sockets.indexOf(ws);
    if (idx > -1) {
      sockets.splice(idx, 1);
    }
    console.log(`[-] Client Left`);
  }

  function onClientMessage(data) {
    const res = JSON.parse(data);
    if (res.type === "log") {
      const { type, deviceName, args } = res;
      console[type](`📱 ${deviceName}>`, ...args);
    }
  } //

  wss.on("connection", (ws, req) => {
    onClientJoin(ws, req);
    ws.on("message", onClientMessage);
    ws.on("close", () => onClientLeave(ws));
    updateCode(ws);
  });

  httpServer.listen(port, function () {
    console.log("server running on 8080");

    const sandboxUrl = getSandboxUrl();
    const biscuitUrl = getBiscuitUrl();
    QRCode.toString(biscuitUrl, { type: "terminal" }, function (err, code) {
      console.log(code);
      console.log(`🚀 Open url in browser: ${sandboxUrl}`);
      console.log(`🚀 Deeplink url in Biscuit app: ${biscuitUrl}`);
    });
  }); //the server object listens on port 8080

  const watcher = chokidar.watch(watchDir);
  watcher.on("change", function (_eventName, _path, _stats) {
    console.log("sockets", sockets.length);
    sockets.forEach((ws) => updateCode(ws));
  });
};

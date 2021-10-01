const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const fileListUrl = `http://localhost:9222/json`;
const fileSocketMap = {};
const payload = {
  id: 1337,
  method: "Runtime.evaluate",
  params: { expression: "" },
};

let fileList;
let payloads = "";

const sendPayload = (id, client) => client.send(JSON.stringify(payload));

const buildPayloads = () => {
  const dir = path.join(__dirname, "payloads/");
  const filenames = fs.readdirSync(dir);

  filenames.forEach((filename) => {
    const payload = fs.readFileSync(dir + filename).toString();
    payloads += payload;
  });

  // Wrapper for payloads, so they only run once per file/page
  payload.params.expression = `
    (function () {
        if (typeof window.hasBeenPatched === "undefined") {
            
            ${payloads}

            window.hasBeenPatched = true;
        }
    })();
  `;
};

const pollAndInject = async () => {
  let response = await fetch(fileListUrl);

  fileList = await response.json();

  fileList.forEach((file) => {
    // Skip official Figma pages
    if (
      file.title === "Figma" ||
      file.title === "DevTools" ||
      file.title === "Recently viewed – Figma" ||
      file.url === "https://www.figma.com/community"
    )
      return;

    const client = fileSocketMap[file.id];

    if (client && client.readyState === WebSocket.OPEN) {
      sendPayload(file.id, client);
    } else {
      const newClient = new WebSocket(file.webSocketDebuggerUrl);
      newClient.on("open", async () => sendPayload(file.id, newClient));
      fileSocketMap[file.id] = newClient;
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 3000)); // fetch list of files every 3s
  await pollAndInject();
};

buildPayloads();
pollAndInject();

console.log(
  "Patcher Running...please keep this window open, you can minimize it if you want."
);

const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const CDP = require('chrome-remote-interface');
const express = require('express');

const fileListUrl = `http://localhost:9222/json`;
const fileSocketMap = {};
const mainPayload = {
  id: 1337,
  method: "Runtime.evaluate",
  params: { expression: "" },
};

let fileList;
let payloads = ''
let dependencies = '';

const sendPayload = (client) => client.send(JSON.stringify(mainPayload));

const initializeWebSocket = (file) => {
  const connect = () => {
    const newClient = new WebSocket(file.webSocketDebuggerUrl);

    newClient.on("open", async () => {
      sendPayload(newClient);
    });

    newClient.on("close", () => {
      console.log("WebSocket connection closed. Reconnecting...");
      // Add a delay before attempting to reconnect (adjust as needed)
      setTimeout(() => {
        connect(); // Recursively attempt to reconnect
      }, 3000); // Example: Retry every 2 seconds
    });

    newClient.on("error", (error) => {
      console.error("WebSocket connection error:", error);
      // You may want to handle the error or retry logic here
    });

    fileSocketMap[file.id] = newClient;
  };

  connect(); // Initial connection attempt
};

const buildPayloads = () => {
  const dir = path.join(__dirname, "payloads/");
  const filenames = fs.readdirSync(dir);

  filenames.forEach((filename) => {
    const payload = fs.readFileSync(dir + filename).toString();

    // We prefix vendor/dep packages with _ and put them at the top of the bundle
    if (filename.startsWith('_')) {
      dependencies += payload;
    } else {
      payloads += payload;
    }
  });

  // Wrapper for payloads, so they only run once per file/page
  mainPayload.params.expression = `
  (function () {
    try {
      if (window.hasBeenPatched) {
        console.log('Already patched; skipping.');
        return;
      }
      console.log('Patching...');
      ${dependencies}
      ${payloads}
    } catch (error) {
      console.error('Error during patching:', error);
    } finally {
      console.log('Patching complete.');
      window.hasBeenPatched = true;
    }
  })();
`;
};

const pollAndInject = async () => {
  let response = await fetch(fileListUrl);

  fileList = await response.json();

  fileList.forEach((file) => {
    if (
      file.title === "Figma" ||
      file.title === "DevTools" ||
      file.title === "Recently viewed – Figma" ||
      file.url === "https://www.figma.com/community"
    )
      return;

    const client = fileSocketMap[file.id];

    if (client && client.readyState === WebSocket.OPEN) {
      sendPayload(client);
    } else {
      initializeWebSocket(file);
    }
  });

  await sleep(3000);
  await pollAndInject();
};

buildPayloads();
pollAndInject();

// experimental
const app = express();
const port = 3000;

// WebSocket server
const wss = new WebSocket.Server({ server: app.listen(port) });

// WebSocket connection handler
wss.on('connection', (ws) => {
  // Establish a connection to the Chrome DevTools Protocol
  CDP(async (client) => {
    const { Network, Page, Runtime, Input, DOM } = client;
    await Promise.all([Network.enable(), Page.enable(), Runtime.enable(), DOM.enable()]);

    // Handle messages from the browser
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      const { command, name } = data

      if (command === 'plugin') {
        console.log('command plugin received')

        await clickElementBySelector(client, '#toolbar-action-component-insert');
        await clickElementBySelector(client, '[data-label="Plugins"]');
        // await sleep(50);
        await Input.insertText({text: name});
        await sleep(10);
        console.log('attempting to submit...');
        // await Runtime.evaluate({
        //   expression: `document.querySelector('[data-testid="search-bar-input"]').focus()`
        // });
        await sleep(10);
        await Input.dispatchKeyEvent({ type: 'rawKeyDown', key: 'Enter', code: 'Enter', location: 0, text: '\r', unmodifiedText: '\r', nativeVirtualKeyCode: 13, windowsVirtualKeyCode: 13 });
        await sleep(10);
        await Input.dispatchKeyEvent({ type: 'keyUp', key: 'Enter', code: 'Enter', location: 0, text: '\r', unmodifiedText: '\r', nativeVirtualKeyCode: 13, windowsVirtualKeyCode: 13 });

        console.log('submit attempted many ways');

        // send status
        ws.send(JSON.stringify({ status: 'Plugin loaded from nodejs' }));
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
});

async function clickElementBySelector(client, selector) {
  try {
      const { Input, DOM } = client;
      const { root } = await DOM.getDocument();

      // Step 1: Get nodeId of the element using DOM.querySelector
      const node = await DOM.querySelector({ nodeId: root.nodeId, selector });

      console.log(node);

      if (node && node.nodeId) {
          // Step 2: Get box model of the element using DOM.getBoxModel
          const boxModel = await DOM.getBoxModel({ nodeId: node.nodeId });

          // Get the BoxModel center
          const coords = {
              x: Math.round(boxModel.model.content[0] + boxModel.model.width / 2),
              y: Math.round(boxModel.model.content[1] + boxModel.model.height / 2)
          };

          // Step 3: Find the node for the location
          const eleClick = await DOM.getNodeForLocation({ x: coords.x, y: coords.y });

          // Step 4: Dispatch the click event
          await Input.dispatchMouseEvent({ type: "mouseMoved", x: coords.x, y: coords.y });
          await Input.dispatchMouseEvent({ type: "mousePressed", x: coords.x, y: coords.y, button: "left", clickCount: 1 });
          await Input.dispatchMouseEvent({ type: "mouseReleased", x: coords.x, y: coords.y, button: "left", clickCount: 1 });
      }
  } catch (error) {
      console.error('Error:', error);
  }
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log(`WebSocket server is running on port ${port}`);

console.log(
  "Patcher Running...please keep this window open, you can minimize it if you want."
);

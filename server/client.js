
const dgram = require("node:dgram");
const { argv } = require("node:process");
const socket = dgram.createSocket("udp4");

const GET_IP = 1;
const GET_MESSAGE = 2;

let otherClient;
let state = GET_IP;

let index = 0;

socket.on('message', (msg, rinfo) => {
  switch (state) {
    // Get IP of the other device we are talking too.
    case GET_IP:
      otherClient = JSON.parse(msg);

      // Print other client info
      console.log(`Other IP: ${otherClient.address}:${otherClient.port}`);

      socket.send("Hello World! I hope you get this....", otherClient.port, otherClient.address);
      state = GET_MESSAGE;
      break;
    case GET_MESSAGE:
      console.log(`UDP Port Punching worked!`);
      console.log(`Received message from: ${rinfo.address}:${rinfo.port}`);
      console.log(`Msg was.... ${msg}`);
      socket.send(`Sending message ${index++}`, rinfo.port, rinfo.address, () => {
        if (index >= 5) {
          socket.close();
        }
      });
      break;
  }
});

if (argv.length < 4) {
  console.error(`Expected 4 arguments! "node client.js <ip> <port>`);
  socket.close();
} else {
  socket.send("Hello World!", Number.parseInt(argv [3]), argv [2]);
}

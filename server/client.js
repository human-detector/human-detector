
const dgram = require("node:dgram");
const { argv } = require("node:process");
const socket = dgram.createSocket("udp4");

const GET_ROLE = 0;
const GET_IP = 1;
const GET_MESSAGE = 2;

const ROLE_HOST = 0;
const ROLE_CLIENT = 1;

let role;
let otherClient;
let state = GET_ROLE;

socket.on('error', err => {
  console.error(`client error:\n${err.stack}`);
  socket.close();
});

let index = 0;

socket.on('message', async (msg, rinfo) => {
  switch (state) {
    // Are we host sending info (stream) or client receiving?
    case GET_ROLE:
      if (msg == "Client1") role = ROLE_HOST;
      else if (msg == "Client2") role = ROLE_CLIENT;
      state = GET_IP;
      break;
    // Get IP of the other device we are talking too.
    case GET_IP:
      otherClient = JSON.parse(msg);

      // Print other client info, and role we play
      const roleStr = role ? "Client" : "Host";
      console.log(`Role: ${roleStr}, Other IP: ${otherClient.address}:${otherClient.port}`);

      socket.send("Hello World! I hope you get this....", otherClient.port, otherClient.address);
      console.log("Sent UDP Packet to other IP!");
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
  }
});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`client listening ${address.address}:${address.port}`);
});

if (argv.length < 4) {
  console.error(`Expected 4 arguments! "node client.js <ip> <port>`);
  socket.close();
} else {
  socket.send("Hello World!", Number.parseInt(argv [3]), argv [2]);
}

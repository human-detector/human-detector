
const dgram = require("node:dgram");
const socket = dgram.createSocket("udp4");

socket.on('error', err => {
    console.error(`client error:\n${err.stack}`);
    socket.close();
});

socket.on('message', (msg, rinfo) => {
    console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    socket.close()
});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`client listening ${address.address}:${address.port}`);
});

socket.send("Hello World!", 30000, "localhost");

const dgram = require("node:dgram");
const server = dgram.createSocket("udp4");

let client1 = null;
let client2 = null;
let numClients = 0;

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    if (numClients == 0) {
        client1 = rinfo;
        numClients++;
    } else {
        client2 = rinfo;
        numClients = 0;
        
        server.send(JSON.stringify(client2), client1.port, client1.address);
        server.send(JSON.stringify(client1), client2.port, client2.address);
    }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(25566);
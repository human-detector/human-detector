const dgram = require("node:dgram");
const server = dgram.createSocket("udp4");

server.on('error', err => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

let client1 = null;
let client2 = null;
let numClients = 0;

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    if (numClients == 0) {
        client1 = rinfo;
        server.send("Client1", rinfo.port, rinfo.address);
        numClients++;
    } else {
        client2 = rinfo;
        numClients = 0;
        server.send("Client2", rinfo.port, rinfo.address);
        
        server.send(JSON.stringify(client2), client1.port, client1.address);
        server.send(JSON.stringify(client1), client2.port, client2.address);
    }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(30000);
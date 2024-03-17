const net = require('net');
const readline = require('readline');

const serve = net.createServer((socket) => {
    console.log('client connect');

    socket.on('data', (data) => {
        console.log(`Recive data for client : ${data}`);
    
        socket.write(data);

    });

    socket.on('end', () => {
        console.log('client disconnect');
    });
});

const port = 8080;
serve.listen(port, () => {
    console.log(`Server listen on port: ${port}`);
});

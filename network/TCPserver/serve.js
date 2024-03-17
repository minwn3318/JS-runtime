const net = require('net');

//1. 서버의 소켓을 생성하고(socket함수), 
//4. 클라이언트와 연결하는 것(accept함수)이 되어 있다.
const serve = net.createServer((socket) => {
    console.log('client connect');

    // 5. 클라이언트에게 데이터를 받고(recive함수)
    socket.on('data', (data) => {
        console.log(`Recive data for client : ${data}`);
    
        // 6. 보내는 것까지(send함수) 구현되어있다.
        socket.write(data);

        // 연결을 마친다
        socket.end('end', () => {
            console.log('client disconnect');
        });
    });
});



//2. 1.에서 생성한 소켓의 주소에 들어갈 소켓 주소구조체를 생성해 할당하고(bind함수)
//3. 클라이언트에게 연결요청 받고 대기하는(listen함수) 것이 구현되어있다.
// 이후 이벤트가 연결 이벤트가 발생하여야 클라이언트와 연결되면서 메세지를 받고 전달하는 함수가 진행될 수 있다.
const port = 8080;
serve.listen(port, () => {
    console.log(`Server listen on port: ${port}`);
});

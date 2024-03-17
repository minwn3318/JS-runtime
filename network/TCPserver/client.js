const net = require('net');

//소켓 생성(socket)
const client = new net.Socket();

const port = 8080;
const host = 'localhost';

//소켓의 주소를 할당하고 서버에 연결 요청을 한다(accept)
client.connect(port, host, () => {
  console.log(`Connected to server: ${host}:${port}`);

  // 서버에 데이터를 보낸다(send)
  client.write('Hello, server!');
  console.log('Hello, server!-1')
});

// 서버에 데이터를 받는다(recive)
client.on('data', (data) => {
  console.log(`Received from server: ${data}`);

});

// 연결종료(close)
client.on('close', () => {
  console.log('Connection closed');
});
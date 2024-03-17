const net = require('net');
const readline = require('readline');
const process = require('process');

//소켓 생성(socket)
const client = new net.Socket();

const port = 8080;
const host = 'localhost';

//소켓의 주소를 할당하고 서버에 연결 요청을 한다(accept)
client.connect(port, host, () => {
  console.log(`Connected to server: ${host}:${port}`);

  // 보낼 내용을 입력 받을 인터페이스를 연다
  const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
  });

  // 보낼 내용을 입력 받고 보낸다
  rl.on("line", (line) => {

    console.log("input : " + line);

    client.write(line);

    // 서버에서 데이터를 받는다(recive)
    client.on('data', (data) => {

      console.log(`Received from server: ${data}`);

    });

    client.on('close', () => {
      
      console.log('Connection closed');
      rl.close();
      
    });

  });

});
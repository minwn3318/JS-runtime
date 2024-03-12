## 챕터 2의 브로드캐스트 내용 설명   

### 1. 최초의 피어 깨어남
```
function initP2PServer(){ //웹소켓 서버  초기화
    const server = new WebSocket.Server({port : p2p_port}); // 웹소켓의 서버 객체를 할당된 포트번호로 생성
    server.on("connection", function (ws) {initConnection(ws);}); // 웹소켓를 서비스 전 대기열로 올리는데 연결이라는 이름의 대기열에 연결초기화함수 처리 후 올린다 
    console.log("listeing websocket p2p port on:"+ p2p_port);
}
```
1. 피어들끼리 소통하기 위해 웹소켓 서버가 초기화한다. 이때 웹소켓 서버는 연결을 초기화 시킨다
```
var sockets = []; //소켓들을 저장하는 객체

function getSockets() { return sockets; } //소켓배열을 반환한다

function initConnection(ws){ //연결초기화 함수
    sockets.push(ws); //배열형 객체에 요소 객체를 넣음 -> 소켓을 소켓배열객체에 넣음
    intiMessageHandler(ws); //소켓의 메세지 핸들러를 초기화한다
    initErrorHandler(ws); //소켓의 에러 핸들러를 초기화한다
    write(ws, queryChainLengthMsg()); //해당 주소 소켓의 블럭 길이를 제이슨화시켜 요청자에게 보낸다
}
```
2. 연결 초기화시 웹소켓서버를 각 피어들의 집합 배열에 넣어주고, 메세지 핸들러와 에러핸들러를 초기화 시키고, 클라이언트(어플)에게 서버의 블록길이를 전달한다
   
### 2. 다른 피어가 연결 요청
```
    app.post("/addpeers", function (req, res){//피어를 추가해달라는 요청
        const peers = req.body.peers || []; //요청쪽에서 포트 주소가 담긴 http 프로토콜의 메세지 몸체 객체를 저장
        connectToPeers(peers); //그 메시지 몸체의 피어의 주소를 담음
        res.send(); //응답한다
    })

```
1. 개인 클라이언트가 네트워크에 참여를 요청하기에 개인 http서버에 네트워크 참여를 요청한다. 그러면 http서버는 웹소켓 연결을 시킨다 

```
function connectToPeers(newPeers){ //요청된 피어주소에 순차적으로 웹소켓을 만들고 소켓 배열에 넣어준다 
    newPeers.forEach(
        function(peer){
            const ws = new WebSocket(peer);
            ws.on("open", function () {initConnection(ws);});
            ws.on("error", function () {console.log("connection failed");});
        }
    );
}
```
2. 받은 포트번호 혹은 포트번호 모음으로 각 웹소켓을 만들어 연결초기화 시킨다.
   
### 3. 블록생성   
```
    app.post("/mineBlock", function (req, res) {/
        const data = req.body.data || []; 
        const newBlock = mineBlock(data); 
        if (newBlock == null) {
            res.status(400).send('Bad Request'); 
        }
        else{
            res.send(newBlock);
        }
    });
```
1. 개인 클라이언트가 개인 서버에 블록 생성을 요청하면 http 서버는 블록을 생성한다
```
function mineBlock(blockData) { // 블록생성 함수
    const newBlock = generateNextBlock(blockData); //다음 블록을 지금 블록데이터를 받아 생성

    if(addBlock(newBlock)) {//블록을 추가한것이 성공하면
        broadcast(responselaatestMsg()); //브로드캐스트를 한다
        return newBlock; //생성된 블럭을 반환한다
    }
    else{
        return null;
    }
}
```
2. 블록을 생성하고 노드의 원장에 블록을 추가한다. 그것이 성공하면 다른 피어에게 블록추가를 알리기 위해 브로드캐스트 한다 
### 4. 브로드 캐스트 
```
function queryAllMsg(){ //모든 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.QUERY_ALL,
        "data" : null
    });
}

function queryChainLengthMsg() { // 최신 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.QUERY_LATEST,
        "data" : null
    });
}

function responseChainMsg(){ //반응으로 모든 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.RESPONSE_BLOCKCHAIN,
        "data" : JSON.stringify([getBlockchain()]) //블록체인 전체를 문자열 제이슨화 시킨다
    });
}

function responseLatestMsg() { //반응으로 최신 블럭의 데이터를 객체로 보낸다
    return ({
        "type" : MessageType.RESPONSE_BLOCKCHAIN,
        "data" : JSON.stringify([getLatestBlock()]) //최신 블록을 문자열 제이슨화 시킨다
    });
}
```
* 해당 내용은 브로드캐스트 시 전달받은 객체의 타입이 어떤걸 의미하는 지 받는 내용이다.
  1. 모든 블록체인 데이터를 요청한다는 내용이다
  2. 최신 블록 데이터를 요청한다는 내용이다
  3. 응답으로 자산의 블록체인 데이터를 제이슨 문자열로 전달한다
  4. 응답으로 자신의 최신 블록 데이터를 제이슨 문자열로 전달한다
```
function write(ws, message) {ws.send(JSON.stringify(message));} //서버 소켓이 클라이언트에게 객체를 제이슨화 시켜 보낸다

function broadcast(message){ // 브로드 캐스트
    sockets.forEach(function (socket){ //소켓배열의 각 객체에게 메세지 내용을 전달한다
        write(socket, message);
    }) 
}
```
1. 브로드캐스트는 각 소켓에게 위의 해당 메세지를 전달하는 식으로 된다
```
function intiMessageHandler(ws) { //메세지 핸들러 초기화 함수
    ws.on("message", function (data){ //메세지 대기열에 메세지를 확인하는 함수를 적용시킨 객체 소켓을 올린다 
        const message = JSON.parse(data); // 제이슨을 객체로 변화

        switch (message.type) { // 메세지의 타입 확인
            case MessageType.QUERY_LATEST : //타입이 최근 쿼리를 갖오는 거라면
                write(ws, responseLatestMsg()); //나의 최근 블록을 객체로 받아 제이슨으로 보낸다
                break;
            case MessageType.QUERY_ALL : //타입이 모든 쿼리를 가지고는 오는 거라면
                write(ws, responseChainMsg());  //나의 블록체인를 객체로 받아 제이슨으로 보낸다
                break;
            case MassgeType.RESPONSE_BLOCKCHAIN : //타입이 블록체인을 처리하는 거라면
                handleBlockchainResponse(message);
                break;
        }
    });
}
```
2. 소켓에서 메세지를 받으면 메세지를 원 객체로 바꾼다. 그리고 객체에 따라 처리를 다르게 한다 
```
function handleBlockchainResponse(message) {
    const receivedBlocks = JSON.parse(message.data); //전파받은 블록 데이터의 제이슨을 블록체인 배열 객체로 변환한다
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1]; //받아온 블록체인의 최신 블록을 얻는다
    const latestBlockHeld = getLatestBlock(); // 자신의 최근 블록을 가져온다

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) { // 받은 블록의 인덱스가 가지고 있는 인덱스보다 길다면 갱신해야하나든 의미가 된다
        console.log(
            "Blockchain possibly behind."
            + " we got:" + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );

        if (calculateHashForBlock(latestBlockHeld) == latestBlockReceived.header.previousHash){ // 받은 블록의 이전해시가 내 최신 블럭의 해시와 값이 같다면 
            console.log("We can append the received block to our chain"); //새로운 블록 하나라는 의미가 된다
            if (addBlock(latestBlockReceived)) { //받은 블록은 자신의 블록체인에 더하고
                broadcast(responseLatestMsg()); // 다른 피어들에게 이 새 블록을 원장에 넣으라고 요청한다
            }
        }
        else if (receivedBlocks.length == 1){ // 받은 블록체인 길이가 1이라면
            console.log("We have to query the chain from our peer"); //중간에 블록을 놓쳤다는 의미가 된다
            broadcast(queryAllMsg()); // 따라서 다른 피어의 블록체인의 데이터를 받아 어디서 놓쳤는지 확인한다
        }
        else{ // 블록체인 길이가 내가 가진 길이보다 길고, 인덱스도 크고  받은 블록의 이전 해시값이 자신의 최신 블록의 해시값이 아니면 
            console.log("Received blockchain is longer than current blockchain"); // 새로운 블록이 여러개라는 의미가 된다
            replaceChain(receivedBlocks); //따라서 내 원장을 받은 블록체인으로 바꾼다
        }
    }
    else {console.log("Receied blockchain is not longer than current blockchain. Do nothing");} //인덱스가 크지 않다는 것은 자신의 블록체인에 갱신할 내용이 없는드 의미가된다
}

```
3. 처리과정
   + 받은 블록이 새로운 블록이라는 걸 알게 되면(인덱스가 자신의 최신 블록보다 큼)
     1. 그 새로운 블록의 이전해시값이 자신의 최신 블록 해시값과 같다면 자기 바로 다음 블록이라는 의미로 바로 해당 블록을 자신의 블록체인에 더하고 다른 노드들에게 브로드 캐스팅 한다
     2. 만약 인덱스는 큰데 블록체인 전체 길이가 1밖에 되지 않는다면 중간에 블록의 오류가 발생한 것이므로 모든 블록의 쿼리를 받아 놓친부분을 찾는다
     3. 새로운 블록이 꽤 지난 뒤에 나타난 것이라면 블록체인을 해당 받은 블록의 블록체인으로 바꾼다

# onechain 코드 매서드 서비스 구조 설명

## 기본 메인함수 실행시 매서드 작동 구조 설명 
```
// main
(async function () { // (async)
    await initBlockchain(); // (await)
    connectToPeers(initialPeers); //초기 피어 연결
    initHttpServer(); //http 서버 초기화
    initP2PServer(); //피투피 서버 초기화
    initWallet(); //지갑 초기화
})();
```

===

### 1. initBlockchain(): 데이터베이스에서 기존의 블록체인을 로드하거나, 제네시스 블록으로 시작하는 새 블록체인을 생성하여 블록체인을 초기화한다.

+ blockchain.js의 해당 함수 정의

```
var blockchain;

async function initBlockchain() { 
    /* 1 */ 
    const loadedBlockchain = await new Blockchain().load(); 
    /* 2 */
    if (loadedBlockchain !== undefined) {
        blockchain = loadedBlockchain; 
    }
    /*3*/
    else { 
        const newBlockchain = new Blockchain([getGenesisBlock()]);
    /*4*/ 
        try { newBlockchain.save(); } catch (err) { throw err; } 
        blockchain = newBlockchain; 
    }
}
```

  1. type.js에 정의된 blockchain의 클래스 객체를 로드후 생성하여 객체변수에 저장한다

```
  /*1*/
  class Blockchain { //블록 체인 클래스
    constructor(blocks) { //객체생성
        this._blocks = deepCopy(blocks); // 받은 블록체인을 깊은 복사하여 생성한다 (주소 공유안함)
        try { this._length = this.blocks.length; } catch (err) { /* console.log(err); */ } // for decode()
    }}

    function deepCopy(src) { //깊은 복사 내용
    return cloneDeep(src); //객체 깊은 복사 모듈사용
  } 

  /*2*/
    async load() { //로드
        try {
            const encodedBlockchain = await db.get("Blockchain"); //데이터베이스에서 블록체인이라는 파일을 가져와 객체에 저장한다
            return new Blockchain().decode(encodedBlockchain); //제이슨파일로 되어있는 것을 js객체로 변환하여 반환한다
        }
        catch (err) {
            return undefined; //만약 파일이 존재하지 않는다면 정의되지 않음을 반환한다
        }
    }

  /*3*/
    const dbLocation = "db/" + (process.env.DB || process.env.P2P_PORT || 6001); // 로컬폴더경로를 지정한다
          recursiveMkdir(dbLocation); //저장장소에 저정하기

          const db = level(dbLocation);//(level) //어떤 경로에 있는 폴더를 가져올때 사용할 객체 변수이다

  /*4*/
    decode(encodedBlock) { //js로 읽을 수 있는 형태로 변환
        var decodedBlock = JSON.parse(encodedBlock); //json파일을 js의 객체형으로 바꾼다
        var objectifiedBlock = Object.assign(new Block(), decodedBlock);// 바꾼 객체형을 블록 객체와 대응되게 만들고 반환한다
        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header); // 이하동문으로 헤더를 만들고 반환한다
        return objectifiedBlock; 오브젝트 반환
    }

```

  2. 객체변수에 아무것도 정의되지 않은 것, null 상태가 아닌 정의된 객체가 들어가 있다면 앞서 정의한 빈 변수 객체에 저장한다

  3. 그렇지 않다면 제내시스 블록 생성 매서드를 직접 호출하여 블록체인 객체를 생성해 저장한다.

  4. 이때 블록체인을 세이브 매서드를 통해 제이슨 파일로 저장한다

```
/*1*/
    async save() { //데이터 저장
        const encodedBlockchain = this.encode(); //해당 내용을 인코드
        try { await db.put("Blockchain", encodedBlockchain); } //블록체인 파일경로에 인코드한 내용저장
        catch (err) { throw err; }
    }

/*2*/
    encode() { //데이터를 제이슨파일로 인코드
        return JSON.stringify(this);
    }
```

===

### 2. initHttpServer(): Express 프레임워크를 사용하여 HTTP 서버를 초기화하고, 다양한 API 엔드포인트를 설정하여 블록체인 데이터에 대한 액세스 및 

   블록 생성 등의 기능을 제공한다.

```
    const app = express(); //express 워크프레임 모듈 할당
    app.use(cors()); //(cors)라는 미들웨어(자주 쓰는 웹프레임워크(get,post 등등의 메서드 정의)) 브라우저의 호환성 보장
    app.use(json()); //(use.json) 이하 동문 주로 제이슨파일에 관한 처리 담당

    /*중략*/

    app.listen(http_port, function () { console.log("Listening http port on: " + http_port) }); //서비스 대기

```

===

### 3. connectToPeers(): 초기 피어 목록을 기반으로 다른 노드에 연결을 시도하고, P2P 네트워크에 참여한다.

```
function connectToPeers(newPeers) { //연결하기(on)
    newPeers.forEach( // 소켓배열의 각소켓마다 연결하기
        function (peer) {
          /*1*/
            const ws = new WebSocket(peer);
            /*2*/
            ws.on("open", function () { initConnection(ws); });
            ws.on("error", function () { console.log("Connection failed"); });
        }
    );
}
```
  1. 소켓객체를 생성한다

===

  2. 소켓체의 이벤트로 연결 이벤트를 등록하는 함수를 선언한다

   ```
   function initConnection(ws) { //연결 초기화
      /*1*/
       sockets.push(ws);
       /*2*/
       initMessageHandler(ws);// 메세지 헨들러 초기화
       /*3*/
       initErrorHandler(ws); //에러 핸들러 초기화
       /*4*/
       write(ws, queryChainLengthMsg());
    }
   ```
     + 1. 소켓배열에 연결되는 다른 웹소켓을 추가한다
     
     + 2. 소켓의 메세지핸들러를 초기화한다

     ```
      function initMessageHandler(ws) { //메세지 핸들러
       ws.on("message", function (data) {
        const message = JSON.parse(data); //제이슨 내용을 객체로 받는다
        // console.log("Received message" + JSON.stringify(message));

        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg()); //블록최신 보내기
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg()); //블록체인 길이 보내기
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message); //블록생성 반응 보내기
                break;
        }
       });
     }
     ```
     + 메세지 보내기 구조체

     ```
          const MessageType = { //메세지 타입
          QUERY_LATEST: 0,
          QUERY_ALL: 1,
          RESPONSE_BLOCKCHAIN: 2
          };

          function queryAllMsg() { //쿼리 얻기 제이슨 타입
          return ({
          "type": MessageType.QUERY_ALL,
          "data": null
          });
          }

          function queryChainLengthMsg() { //블록체인 얻기
          return ({
          "type": MessageType.QUERY_LATEST,
          "data": null
          });
          }

          function responseChainMsg() { //블록체인이 제이슨으로 변환되어서 온거 보내기
          return ({
          "type": MessageType.RESPONSE_BLOCKCHAIN,
          "data": getBlockchain().encode()
          });
          }

          function responseLatestMsg() { //최근 블록 제이슨으로 만들어서 보내기
          return ({
          "type": MessageType.RESPONSE_BLOCKCHAIN,
          "data": new Blockchain([getLatestBlock()]).encode()
          });
          }
     ```

     + 3. 에러 핸들러를 초기화 한다

     ```
     
          function initErrorHandler(ws) { //에러핸들러 초기화
          ws.on("close", function () { closeConnection(ws); });
          ws.on("error", function () { closeConnection(ws); });
          }

          function closeConnection(ws) { //소켓배열에서 마지막 열 하나를 삭제한ㄴ다
          console.log("Connection failed to peer: " + ws.url);
          sockets.splice(sockets.indexOf(ws), 1);
          }
     ```

     + 4. 해당 내용을 다른 연결된 피어에도 알린다 

     ```
     function write(ws, message) { ws.send(JSON.stringify(message)); } //http에서 읽혀지는 제이슨형태로 쓰서 보내기
     ```
===

### 4. initP2PServer(): WebSocket을 사용하여 P2P 서버를 초기화하고, 다른 노드와의 실시간 데이터 교환을 가능하게 한다.

```
function initP2PServer() { //피투피 서버 초기화
    const server = new Server({ port: p2p_port });
    server.on("connection", function (ws) { initConnection(ws); }); //연결이라는 이름으로 함수배열 만들어서 해당 함수가 호출됐을 때 소켓이 작동되도록 함
    console.log("Listening websocket p2p port on: " + p2p_port);
}
```

+ connection은 위의 3번과 같다. 3번과 차이점은 아에 웹소켓을 관할할 수 있는 서버를 만든 것이다

===

### 5. initWallet(): 지갑의 개인 키가 없는 경우 새로 생성하고, 있다면 해당 키를 로드하여 지갑을 초기화한다.

```
function initWallet() {
/*1*/
    if (existsSync(privateKeyFile)) {
        console.log("Load wallet with private key from: " + privateKeyFile);
        return;
    }

/*2*/
    recursiveMkdir(privateKeyLocation);

/*3*/
    const newPrivateKey = generatePrivateKey();
    /*4*/
    writeFileSync(privateKeyFile, newPrivateKey);
    console.log("Create new wallet with private key to: " + privateKeyFile);
}
```

  1. 비밀키 파일이 존재한다면 바로 반환값을 내어 함수를 끝낸다

  2. 그렇지 않다면 파일이 존재할 폴더경로를 만든다

  3. 비밀키를 생성한다

  ```
  function generatePrivateKey() { //키 생성
    const keyPair = ec.genKeyPair(); //공개키 비밀키 쌍을 타원곡선에서 가져온다
    const privateKey = keyPair.getPrivate(); //키 쌍에서 비밀키를 가져온다
    return privateKey.toString(16); //문자열로 바꾼다
  }
  ```
  4. 비밀키파일에 해당 키를 적는다
===

## http 메서드 구조 설명

### 1.
app.get("/blocks"): 클라이언트에게 전체 블록체인을 전송한다. blockchain 모듈의 getBlockchain() 함수를 사용하여 데이터를 검색한다.

```
    app.get("/blocks", function (req, res) { //블럭체인 데이터 호출 -> 전체 블록 목록 보기
        res.send(getBlockchain()); // 서버가 클라이언트한테 블록체인을 보낸다
    });
```

### 2.
app.get('/block/:number'): 번호로 특정 블록을 검색한다. getBlockchain()과 indexWith()을 결합하여 대상 블록을 찾는다.

```
    app.get('/block/:number', function (req, res) { //원하는 블록 호출 (:number)
        try { //에러 발생 조건 (javascript try and catch)
            const targetBlock = getBlockchain().indexWith(req.params.number); //대상블럭 할당 (params.number, indexwith)
            res.send(targetBlock); // 서버가 대상블럭을 클라이언트에게 보낸다
        }
        catch (err) { //에러 발생 감지
            res.status(400).send('Bad Request'); //에러 상태 보내기
            console.log(err); // 에러메세지 로그출력
        }
    });
```

### 3.
app.post("/mineBlock"): 제공된 데이터로 새 블록을 채굴한다. blockchain 모듈의 mineBlock() 함수가 블록 생성을 처리하고 블록체인에 추가한다.

```
    app.post("/mineBlock", function (req, res) { // 블록생성(post get)
        const data = req.body.data || []; //블록생성시 필요 데이터 (body.data)
        const newBlock = mineBlock(data); //데이터를 가지고 블록생성
        if (newBlock === null) { //블록이 없을시(===)
            res.status(400).send('Bad Request'); //에러상태 보내기
        }
        else { //제대로 블록이 할당될시
            res.send(newBlock); //블록보냈음을 알리기(reset api, react api)
        }
    });
```

### 4.
app.get("/version"): 노드 소프트웨어의 현재 버전을 제공한다. utils 모듈의 getCurrentVersion()을 사용한다.

```
    app.get("/version", function (req, res) { //버전 확인
        res.send(getCurrentVersion()); //버전 가져오기
    });
```

### 5.
app.get("/blockVersion/:number"): 특정 블록의 버전을 전송한다. 여기서 버전은 블록 헤더의 속성으로, app.get('/block/:number')과 유사하게 얻는다.

```
    app.get("/blockVersion/:number", function (req, res) { //원하는 블록의 버전 확인
        try {//에러 감지 조건(try)
            const targetBlock = getBlockchain().indexWith(req.params.number); //타겟 블록 할당
            res.send(targetBlock.header.version); //타겟블록의 헤더의 버전 보내기
        }
        catch (err) { //에러 발생시
            res.status(400).send('Bad Request'); // 에러메세지 발송
            console.log(err);
        }
    });
```

### 6.
app.get("/peers"): 연결된 피어 목록을 반환한다. network 모듈의 getSockets()를 사용하여 데이터를 수집한다.

```
    app.get("/peers", function (req, res) { //현재 연결된 피어 목록 호출 (콜백함수와 비동기)
        res.send(getSockets().map(function (s) { //목록 반환(웹소켓, 맵)
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
```

### 7.
app.post("/addPeers"): 새 피어에 연결한다. 요청 본문에 제공된 피어 URL 목록으로 network 모듈의 connectToPeers()를 호출한다.

```
    app.post("/addPeers", function (req, res) { //피어 더하기(피어 추가)
        const peers = req.body.peers || []; //피어 할당
        connectToPeers(peers); //피어 연결
        res.send(); //연결완료 보내기
    });
```

### 8.
app.get("/address"): 노드의 지갑에서 유도된 공개 주소를 되돌려 보낸다. wallet 모듈의 getPublicFromWallet()을 사용한다.

```
    app.get("/address", function (req, res) { //주소확인
        const address = getPublicFromWallet().toString(); //지갑의 공동키에서 문자열 직렬화로 주소 할당
        res.send({ "address": address }); //메세지 보내기
    });
```

### 9.
app.post("/stop"): HTTP 서버를 중지한다. 이는 모듈 함수로 돌아가지 않지만, 프로세스를 종료하는 Node.js의 전역 함수인 process.exit()에 대한 직접 호출이다.

```
    app.post("/stop", function (req, res) { //서버 멈추기
        res.send({ "msg": "Stopping server" });
        process.exit(); //워크 프레임 종료
    });
```
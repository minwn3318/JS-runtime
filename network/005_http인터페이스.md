# 0대 목표 : 행복한 사람되기   
# 최대 목표 : 모든 디지털과 아날로그를 연결하는 인프라 플랫폼 개발자 되기   
# 차대 목표 : 블록체인 전문 웹 백엔드 프로그래머    

## 완성된 챕터 2 코드   
링크 : https://github.com/minwn3318/BlockChain_Note/tree/main/onechain/chapter2.js
## http 인터페이스   
### 전반 과정   
1. 포트번호 할당
```
const http_port = process.env.HTTP_PORT || 3001;
```
+ 종단점이 되는 노드들을 구분하려면 포트번호가 필요함
2. express 및 body-parser 라이브러리 설치
```
npm install express --save
npm instal body-parser -- save  
```
+ **express** : node.js에서 웹 혹은 앱 서버를 만들기 위한 프레임워크
+ **body-parser** : 클라이언트에서 전송한 body(json이나 hxml)을 어떤식으로 파싱(스트링 타입이냐 정수 타입이냐 등등)할 수 있게 해주는 라이브러리

### 사용되는 curl 명령   
1. 원장요청과 응답
```
curl http://127.0.0.1:3001/blocks   
```
+ 원장 요청은 restfu api에서 get을 이용한 요청이다
> **resetful api** : 두 컴퓨터 시스템이 인터넷을 통해 데이터를 교환하고 통신하게 해주는 api
> **get** : 데이터를 주세요라는 뜻

2. 블록생성 요청
**데이터 미포함**
```
curl -X POST http://127.0.0.1:3001/mineblock
```
**데이터 포함**
```
curl -H "Content-type:application/json" --data "{\"data\" : [\"Anything\", \"want\"]}" http://127.0.0.1:3001/mineblock 
```
+ **-X** : 메서드 혹은 요청
+ **POST** : 요청 혹은 메서드의 타입
+ **-H** : http 프로토콜을 사용한다는 의미   
+ **Content-type:application/json** : 메세지 몸체를 정하기 위한 헤더가 어떤것인지 정해줌 일반헤더를 말함
### 사용된 코드   
**모듈 요청**
```
const express = require("express");
const bodyParser = require("body-parser");
```
**http서버 초기화와 프레임워크 선언 및 라이브러리 사용**
```
function initHttpServer() {
    const app = express();
    app.use(bodyParser.json());
```
**블록체인 호출**
```
    app.get("/blocks", function(req, res){
        res.send(getBlockchain());
    });
```
+ function() : 콜백함수   
  > **콜백함수** : 비동기작업을 하는 함수로 해당 함수를 매개변수로 가지고 있는 함수는 비동기작업이 완료되면 해당 콜백함수를 호출한다   
+ req : 요청객체   
+ res : 응답객체   
  > res.send : 응답객체가 메세지를 보내는 것
**블록생성**
```
    app.post("/mineBlock", function (req, res) {
        const data = req.body.data || [];
        const newBlock = mineBlock(data);
        if (newBlock == null) {
            res.status(400).send('Gad Request');
        }
        else{
            res.send(newBlock);
        }
    });
```
+ 요청객체의 데이터와 빈 배열로 블록을 생성한다.   
+ 응답객체는 데이터를 전파시킨다
**버전확인**
```
    app.get("/version", function(_req, res) {
        res.send(getCurrentVersion());
    });
```
**노드 구동 멈추기**
```
    app.post("/stop", function (_req, res){
        res.send({"msg" : "Stopping server"});
        process.exit();
    })

```
**연결된 웹소캣에 있는 피어들 확인하기**
```
    app.get("/peers", function(req, res){
        res.send(getSockets().map(function (s){
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
```
**피어연결**
```
    app.post("/addpeers", function (req, res){
        const peers = req.body.peers || [];
        connectToPeers(peers);
        res.send();
    })
```
**서비스대기 확인**
```
    app.listen(http_port, function() { console.log("Listening http port on:" + http_port) });
}
```
**블록생성후 브로드케스트**
```
function mineBlock(blockData) {
    const newBlock = generateNextBlock(blockData);

    if(addBlock(newBlock)) {
        broadcast(responselaatestMsg());
        return newBlock;
    }
    else{
        return null;
    }
}
```

"use strict";
import { getCurrentVersion } from "./modules"; // 
import { initBlockchain, getBlockchain, mineBlock } from "./modules"; // 
import { getSockets, connectToPeers, initP2PServer } from "./modules"; // 
import { getPublicFromWallet, initWallet } from "./modules"; // 

import cors from "cors";
import express from "express";
import { json } from "body-parser";

const http_port = process.env.HTTP_PORT || 3001; // 환경설정의 포트번호 할당 
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []; //피어초기화 할당 (split)

function initHttpServer() { //서버 초기화
    const app = express(); //express 워크프레임 모듈 할당
    app.use(cors()); //(cors)
    app.use(json()); //(use.json)

    app.get("/blocks", function (req, res) { //블럭체인 데이터 호출 -> 전체 블록 목록 보기
        res.send(getBlockchain()); // 서버가 클라이언트한테 블록체인을 보낸다
    });
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
    app.get("/version", function (req, res) { //버전 확인
        res.send(getCurrentVersion()); //버전 가져오기
    });
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
    app.get("/peers", function (req, res) { //현재 연결된 피어 목록 호출 (콜백함수와 비동기)
        res.send(getSockets().map(function (s) { //목록 반환(웹소켓, 맵)
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
    app.post("/addPeers", function (req, res) { //피어 더하기(피어 추가)
        const peers = req.body.peers || []; //피어 할당
        connectToPeers(peers); //피어 연결
        res.send(); //연결완료 보내기
    });
    app.get("/address", function (req, res) { //주소확인
        const address = getPublicFromWallet().toString(); //지갑의 공동키에서 문자열 직렬화로 주소 할당
        res.send({ "address": address }); //메세지 보내기
    });
    app.post("/stop", function (req, res) { //서버 멈추기
        res.send({ "msg": "Stopping server" });
        process.exit(); //워크 프레임 종료
    });

    app.listen(http_port, function () { console.log("Listening http port on: " + http_port) }); //서비스 대기
}

// main
(async function () { // (async)
    await initBlockchain(); // (await)
    connectToPeers(initialPeers); //초기 피어 연결
    initHttpServer(); //http 서버 초기화
    initP2PServer(); //피투피 서버 초기화
    initWallet(); //지갑 초기화
})();

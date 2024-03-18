"use strict";
import { Blockchain } from "./modules"; // types
import { getLatestBlock, addBlock, replaceChain, getBlockchain } from "./modules"; // blockchain

import WebSocket, { Server, on } from "ws";

const p2p_port = process.env.P2P_PORT || 6001; //피투피 화녁ㅇ설정

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

function responseChainMsg() { //블록체인이 제이슨으로 변환되서 온거 보내기
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": getBlockchain().encode()
    });
}

function responseLatestMsg() { //최근 블록 제이슨 되서 보내기
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": new Blockchain([getLatestBlock()]).encode()
    });
}

var sockets = []; //소켓

function write(ws, message) { ws.send(JSON.stringify(message)); } //소켓 쓰기

function broadcast(message) { //브로드캐스트 수정
    sockets.forEach(function (socket) { //각 소켓마다 쓰기
        write(socket, message);
    });
}

function getSockets() { return sockets; } //소켓배열 구하기

function initP2PServer() { //피투피 서버 초기화
    const server = new Server({ port: p2p_port });
    server.on("connection", function (ws) { initConnection(ws); }); //연결이라는 이름으로 함수배열 만들어서 해당 함수가 호출됐을 때 소켓이 작동되도록 함
    console.log("Listening websocket p2p port on: " + p2p_port);
}

function initConnection(ws) { //연결 초기화
    sockets.push(ws);
    initMessageHandler(ws);// 메세지 헨들러 초기화
    initErrorHandler(ws); //에러 핸들러 초기화
    write(ws, queryChainLengthMsg());
}

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

function initErrorHandler(ws) { //에러핸들러 초기화
    ws.on("close", function () { closeConnection(ws); });
    ws.on("error", function () { closeConnection(ws); });
}

function closeConnection(ws) { //(splice)
    console.log("Connection failed to peer: " + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);
}

function connectToPeers(newPeers) { //연결하기(on)
    newPeers.forEach(
        function (peer) {
            const ws = new WebSocket(peer);
            ws.on("open", function () { initConnection(ws); });
            ws.on("error", function () { console.log("Connection failed"); });
        }
    );
}

function handleBlockchainResponse(message) { //핸들러 반응
    const receivedBlockchain = new Blockchain().decode(message.data); //메세지를 받아 해당 메세지가 있는 블록체인을 디코드하여 저
    const latestBlockReceived = receivedBlockchain.latestBlock(); //최근 블럭 받기
    const latestBlockHeld = getLatestBlock();

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) { //받은 블록이 내 블록보다 한참 앞이다
        console.log(
            "Blockchain possibly behind."
            + " We got: " + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );
        if (latestBlockHeld.hash() === latestBlockReceived.header.previousHash) { //바로 앞이다
            // A received block refers the latest block of my ledger.
            console.log("We can append the received block to our chain");
            if (addBlock(latestBlockReceived)) { //바로 더한다
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlockchain.length === 1) { //길이가 1이면 새로 시작한다
            // Need to reorganize.
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        }
        else { //아니라면 아예 블록을 바꾼다
            // Replace chain.
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlockchain);
        }
    }
    else { console.log("Received blockchain is not longer than current blockchain. Do nothing"); }
}

export default {
    responseLatestMsg,
    broadcast,
    connectToPeers,
    getSockets,
    initP2PServer
};

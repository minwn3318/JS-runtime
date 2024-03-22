"use strict";
import { Blockchain } from "./modules"; // types
import { getLatestBlock, addBlock, replaceChain, getBlockchain } from "./modules"; // blockchain

import WebSocket, { Server } from "ws";

const p2p_port = process.env.P2P_PORT || 6004;

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

function queryAllMsg() {
    console.log("start----------")
    console.log("[queryAllMsg]");
    console.dir({
        "type": MessageType.QUERY_ALL,
        "data": null
    });
    console.log("end----------");
    return ({
        "type": MessageType.QUERY_ALL,
        "data": null
    });
}

function queryChainLengthMsg() {
    console.log("start----------")
    console.log("[queryChainLengthMsg]");
    console.dir({
        "type": MessageType.QUERY_LATEST,
        "data": null
    });
    console.log("end----------");
    return ({
        "type": MessageType.QUERY_LATEST,
        "data": null
    });
}

function responseChainMsg() {
    console.log("start----------")
    console.log("[responseChainMsg]");
    console.dir({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": getBlockchain().encode()
    });
    console.log("end----------");
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": getBlockchain().encode()
    });
}

function responseLatestMsg() {
    console.log("start----------")
    console.log("[responseLatestMsg]");
    console.dir({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": new Blockchain([getLatestBlock()]).encode()
    });
    console.log("end----------");
    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": new Blockchain([getLatestBlock()]).encode()
    });
}

var sockets = [];

function write(ws, message) {
    console.log("start---------");
    //console.dir(ws); 
    console.log("[write]");
    ws.send(JSON.stringify(message));
    console.log("end--------");
    //console.dir(ws.send(JSON.stringify(message)));  
}

function broadcast(message) {
    console.log("start--------");
    console.log("[brodcast]");

    sockets.forEach(function (socket) {
        console.log("<for>");
        write(socket, message);
    });
    console.log("end----------");
}

function getSockets() { return sockets; }

function initP2PServer() {
    const server = new Server({ port: p2p_port });
    console.log("start----------");
    console.log("[p2pserver]");
    //console.dir(server);
    server.on("connection", function (ws) { initConnection(ws); });
    console.log("Listening websocket p2p port on: " + p2p_port);
    console.log("end----------");
}

function initConnection(ws) {
    console.log("start----------");
    console.log("[initConnection]");
    //console.dir(ws);

    console.log("<socketspush>");
    sockets.push(ws);

    console.log("<initMessageHandler>");
    initMessageHandler(ws);

    console.log("<errorhandelr>");
    initErrorHandler(ws);

    write(ws, queryChainLengthMsg());
    console.log("write : ");
    console.log("end----------");
}

function initMessageHandler(ws) {
    ws.on("message", function (data) {
        console.log("start----------")
        console.log("[initmessagehandler]");
        const message = JSON.parse(data);
        console.log("<message>");
        console.dir(message);

        // console.log("Received message" + JSON.stringify(message));

        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
        console.log("end----------")
    });
}

function initErrorHandler(ws) {
    console.log("start----------")
    console.log("[initErrorHandler]");
    ws.on("close", function () { 
        console.log("close");
        closeConnection(ws); });

    ws.on("error", function () { 
        console.log("close");
        closeConnection(ws); });
    console.log("end----------")

}

function closeConnection(ws) {
    console.log("Connection failed to peer: " + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);
}

function connectToPeers(newPeers) {
    newPeers.forEach(
        function (peer) {
            console.log("start----------");
            console.log("[connecToPeers]");
            const ws = new WebSocket(peer);
            console.log("<ws>");

            ws.on("open", function () { initConnection(ws); });
            console.log("<open>");

            ws.on("error", function () { console.log("Connection failed"); });
            console.log("<error>");
            console.log("end-----------");
        }
    );
}

function handleBlockchainResponse(message) {
    console.log("start----------")
    console.log("[handleBlockchainResponse]")
    const receivedBlockchain = new Blockchain().decode(message.data);
    console.log("<receiveBlockchin>");
    console.dir(receivedBlockchain);

    const latestBlockReceived = receivedBlockchain.latestBlock();
    console.log("<latestBlockReceived>");
    console.dir(latestBlockReceived);

    const latestBlockHeld = getLatestBlock();
    console.log("<latestBlockHeld>");
    console.dir(latestBlockHeld);

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) {
        console.log(
            "Blockchain possibly behind."
            + " We got: " + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );
        if (latestBlockHeld.hash() === latestBlockReceived.header.previousHash) {
            // A received block refers the latest block of my ledger.
            console.log("We can append the received block to our chain");
            if (addBlock(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlockchain.length === 1) {
            // Need to reorganize.
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        }
        else {
            // Replace chain.
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlockchain);
        }
    }
    else { console.log("Received blockchain is not longer than current blockchain. Do nothing"); }
    console.log("End----------");
}

export default {
    responseLatestMsg,
    broadcast,
    connectToPeers,
    getSockets,
    initP2PServer
};

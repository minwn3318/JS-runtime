"use strict";
import { logger } from "./logger";
import { Blockchain } from "./modules"; // types
import { getLatestBlock, addBlock, replaceChain, getBlockchain } from "./modules"; // blockchain

import WebSocket, { Server } from "ws";

const fileName = "network.js";

const p2p_port = process.env.P2P_PORT || 6001;

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

function queryAllMsg() {
    const functionName = "queryAllMsg";
    logger.log({level: 'info', message : 'type1 message', fileN : fileName, functionN:functionName});

    return ({
        "type": MessageType.QUERY_ALL,
        "data": null
    });
}

function queryChainLengthMsg() {
    const functionName = "queryChainLengthMsg";
    logger.log({level: 'info', message : 'type0 message', fileN : fileName, functionN:functionName});

    return ({
        "type": MessageType.QUERY_LATEST,
        "data": null
    });
}

function responseChainMsg() {
    const functionName = "responseChainMsg";
    logger.log({level: 'info', message : 'type2 message blockchain', fileN : fileName, functionN:functionName});

    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": getBlockchain().encode()
    });
}

function responseLatestMsg() {
    const functionName = "responseLatestMsg";
    logger.log({level: 'info', message : 'type2 message blocklatest', fileN : fileName, functionN:functionName});

    return ({
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data": new Blockchain([getLatestBlock()]).encode()
    });
}

var sockets = [];

function write(ws, message) {
    const functionName = "write";
    logger.log({level: 'info', message : JSON.stringify(message), fileN : fileName, functionN:functionName});

    ws.send(JSON.stringify(message));
}

function broadcast(message) {
    const functionName = "broadcast";

    sockets.forEach(function (socket) {
        logger.log({level: 'info', message : 'socket broadcast', fileN : fileName, functionN:functionName});
        write(socket, message);
    });
}

function getSockets() { return sockets; }

function initP2PServer() {
    const functionName = "initP2PServer";
    logger.log({level: 'info', message : 'P2PServer', fileN : fileName, functionN:functionName});

    const server = new Server({ port: p2p_port });

    server.on("connection", function (ws) { 
        logger.log({level: 'info', message : 'P2PServer connection', fileN : fileName, functionN:functionName});
        initConnection(ws); });
    console.log("Listening websocket p2p port on: " + p2p_port);
    logger.log({level: 'info', message : p2p_port, fileN : fileName, functionN:functionName});


}

function initConnection(ws) {
    const functionName = "initConnection";
    logger.log({level: 'info', message : 'initConnection', fileN : fileName, functionN:functionName});

    sockets.push(ws);
    logger.log({level: 'info', message : 'push', fileN : fileName, functionN:functionName});

    initMessageHandler(ws);

    initErrorHandler(ws);

    write(ws, queryChainLengthMsg());
}

function initMessageHandler(ws) {
    const functionName = "initMessageHandler";
    logger.log({level: 'info', message : 'initMessageHandler', fileN : fileName, functionN:functionName});

    ws.on("message", function (data) {
        logger.log({level: 'info', message : 'Message get', fileN : fileName, functionN:functionName});
        const message = JSON.parse(data);

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
    });
}

function initErrorHandler(ws) {
    const functionName = "initErrorHandler";
    logger.log({level: 'info', message : 'initErrorHandler', fileN : fileName, functionN:functionName});

    ws.on("close", function () { 
        logger.log({level: 'info', message : 'close ws', fileN : fileName, functionN:functionName});
        closeConnection(ws); 
    });

    ws.on("error", function () { 
        logger.log({level: 'info', message : 'error ws', fileN : fileName, functionN:functionName});
        //closeConnection(ws); 
    });

}

function closeConnection(ws) {
    const functionName = "closeConnection";
    logger.log({level: 'info', message : 'closeConnection', fileN : fileName, functionN:functionName});
    sockets.splice(sockets.indexOf(ws), 1);
}

function connectToPeers(newPeers) {
    const functionName = "connectToPeers";
    logger.log({level: 'info', message : 'connectToPeers', fileN : fileName, functionN:functionName});

    newPeers.forEach(
        function (peer) {
            logger.log({level: 'info', message : 'newPeers', fileN : fileName, functionN:functionName});

            const ws = new WebSocket(peer);

            ws.on("open", function () { 
                logger.log({level: 'info', message : 'open ws', fileN : fileName, functionN:functionName});
                initConnection(ws); });

            ws.on("error", function () { 
                logger.log({level: 'info', message : 'error ws', fileN : fileName, functionN:functionName});
                console.log("Connection failed"); });
        }
    );
}

function handleBlockchainResponse(message) {
    const functionName = "handleBlockchainResponse";
    logger.log({level: 'info', message : 'handleBlockchainResponse function', fileN : fileName, functionN:functionName});

    const receivedBlockchain = new Blockchain().decode(message.data);

    const latestBlockReceived = receivedBlockchain.latestBlock();

    const latestBlockHeld = getLatestBlock();

    if (latestBlockReceived.header.index > latestBlockHeld.header.index) {
        logger.log({level: 'info', message : 'blockchain possibly behind', fileN : fileName, functionN:functionName});
        console.log(
            "Blockchain possibly behind."
            + " We got: " + latestBlockHeld.header.index + ", "
            + " Peer got: " + latestBlockReceived.header.index
        );
        if (latestBlockHeld.hash() === latestBlockReceived.header.previousHash) {
            // A received block refers the latest block of my ledger.
            logger.log({level: 'info', message : 'We can append the received block to our chain', fileN : fileName, functionN:functionName});
            console.log("We can append the received block to our chain");
            if (addBlock(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlockchain.length === 1) {
            // Need to reorganize.
            logger.log({level: 'info', message : 'We have to query the chain from our peer', fileN : fileName, functionN:functionName});
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        }
        else {
            // Replace chain.
            logger.log({level: 'info', message : 'Received blockchain is longer than current blockchain', fileN : fileName, functionN:functionName});
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlockchain);
        }
    }
    else { 
        logger.log({level: 'info', message : 'Received blockchain is not longer than current blockchain. Do nothing', fileN : fileName, functionN:functionName});
        console.log("Received blockchain is not longer than current blockchain. Do nothing"); }
}

export default {
    responseLatestMsg,
    broadcast,
    connectToPeers,
    getSockets,
    initP2PServer
};

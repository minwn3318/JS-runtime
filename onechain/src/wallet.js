"use strict";
import { logger } from "./logger";
import { recursiveMkdir } from "./modules"; // utils
import { ec } from "./modules"; // crypto

import { existsSync, writeFileSync, readFileSync } from "fs";

const fileName = "wallet.js";

const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || process.env.P2P_PORT || 6001);
const privateKeyFile = privateKeyLocation + "/private_key";

function generatePrivateKey() {
    const functionName = "generatePrivateKey";
    logger.log({level: 'info', message : 'generatePrivateKey', fileN : fileName, functionN:functionName});

    const keyPair = ec.genKeyPair();
    logger.log({level: 'info', message : JSON.stringify(keyPair), fileN : fileName, functionN:functionName});

    const privateKey = keyPair.getPrivate();
    logger.log({level: 'info', message : privateKey.toString(16), fileN : fileName, functionN:functionName});

    return privateKey.toString(16);
}

function initWallet() {
    const functionName = "initWallet";
    logger.log({level: 'info', message : 'initWallet', fileN : fileName, functionN:functionName});

    if (existsSync(privateKeyFile)) {
        console.log("exis : " + existsSync(privateKeyFile));
        console.log("Load wallet with private key from: " + privateKeyFile);

        logger.log({level: 'info', message : 'existsSync', fileN : fileName, functionN:functionName});
        logger.log({level: 'info', message : privateKeyFile, fileN : fileName, functionN:functionName});

        return;
    }

    recursiveMkdir(privateKeyLocation);

    const newPrivateKey = generatePrivateKey();
    logger.log({level: 'info', message : JSON.stringify(newPrivateKey), fileN : fileName, functionN:functionName});

    writeFileSync(privateKeyFile, newPrivateKey);
    console.log("writefile : "+    writeFileSync(privateKeyFile, newPrivateKey));
    
    logger.log({level: 'info', message : 'writeFileSync', fileN : fileName, functionN:functionName});
}

function getPrivateFromWallet() {
    const functionName = "getPrivateFromWallet";
    logger.log({level: 'info', message : 'getPrivateFromWallet', fileN : fileName, functionN:functionName});

    const buffer = readFileSync(privateKeyFile, "utf8");

    logger.log({level: 'info', message : buffer.toString(), fileN : fileName, functionN:functionName});

    return buffer.toString();
}

function getPublicFromWallet() {
    const functionName = "getPublicFromWallet";
    logger.log({level: 'info', message : 'getPublicFromWallet', fileN : fileName, functionN:functionName});

    const privateKey = getPrivateFromWallet();
    const key = ec.keyFromPrivate(privateKey, "hex");
    logger.log({level: 'info', message : JSON.stringify(key), fileN : fileName, functionN:functionName});

    return key.getPublic().encode("hex");
}

export default {
    initWallet,
    getPublicFromWallet
};



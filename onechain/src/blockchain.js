"use strict";
import { deepCopy, getCurrentVersion, getCurrentTimestamp, hexToBinary, deepEqual } from "./modules"; // utils
import { SHA256, calculateMerkleRoot } from "./modules"; // crypto
import { BlockHeader, Block, Blockchain } from "./modules"; // types
import { broadcast, responseLatestMsg } from "./modules"; // network

import { boolean } from "random";

var blockchain;

async function initBlockchain() {
    console.log("start---------");
    console.log("[initblockchain]");
    const loadedBlockchain = await new Blockchain().load();
    console.log("<loadedBlock>");
    console.dir(loadedBlockchain);

    if (loadedBlockchain !== undefined) {
        blockchain = loadedBlockchain;
    }
    else {
        const newBlockchain = new Blockchain([getGenesisBlock()]);
        console.log("<newblockchain>");
        console.dir(newBlockchain);

        try { newBlockchain.save(); } catch (err) { throw err; }
        blockchain = newBlockchain;
    }
    
    console.log("<blockchain>");
    console.dir(blockchain);
    console.log("end----------");
}

function getBlockchain() { 
    console.log("start---------");
    console.log("[getBlockchain]");
    console.log("end----------");
    return deepCopy(blockchain); 
}

function getLatestBlock() { 
    console.log("start---------");
    console.log("[getLatestBlock call]");
    console.log("end----------");
    return deepCopy(blockchain.latestBlock()); 
}

function generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data) {
    console.log("start---------");
    console.log("[generateRawBlock]");
    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce);
    console.log("<header>");
    console.dir(header);
    console.log("end----------");
    return new Block(header, data);
}

function generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data) {
    console.log("start---------");
    console.log("[generateBlock]");
    const merkleRoot = calculateMerkleRoot(data);
    console.log("<merkleRoot>");
    console.dir(merkleRoot);
    console.log("end----------");
    return generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data);
}

function getGenesisBlock() {
    console.log("start---------");
    console.log("[getGenesisBlock]");
    const version = "1.0.0";
    const index = 0;
    const previousHash = '0'.repeat(64);
    const timestamp = 1231006505; // 01/03/2009 @ 6:15pm (UTC)
    const difficulty = 0;
    const nonce = 0;
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"];
    console.log("end----------");

    return generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data);
}

function generateNextBlock(blockData) {
    console.log("start---------");
    console.log("[generateNextBlock]");
    
    const previousBlock = getLatestBlock();
    console.log("<previousBlock>");
    console.dir(previousBlock);

    const currentVersion = getCurrentVersion();
    console.log("<currentVersion>");
    console.dir(currentVersion);

    const nextIndex = previousBlock.header.index + 1;
    console.log("<nextIndex>");
    console.dir(nextIndex);

    const previousHash = previousBlock.hash();
    console.log("<previousHash>");
    console.dir(previousHash);

    const nextTimestamp = getCurrentTimestamp();
    console.log("<nextTimestamp>");
    console.dir(nextTimestamp);

    const merkleRoot = calculateMerkleRoot(blockData);
    console.log("<merkleRoot>");
    console.dir(merkleRoot);

    const difficulty = getDifficulty(getBlockchain());
    console.log("<difficulty>");
    console.dir(difficulty);

    const validNonce = findNonce(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty);
    console.log("<validNonce>");
    console.dir(validNonce);

    console.log("end---------");

    return generateRawBlock(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, validNonce, blockData);
}

function addBlock(newBlock) {
    console.log("start---------");
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        console.log("[newblockchain]");
        console.dir(blockchain);

        try { blockchain.save(); } catch (err) { throw err; }
        return true;
    }
    console.log("end---------");
    return false;
}

function mineBlock(blockData) {
    console.log("start----------")
    console.log("[mineblock]");
    const newBlock = generateNextBlock(blockData);
    console.log("<newBlock>");
    console.dir(newBlock);

    if (addBlock(newBlock)) {
        console.log("<addBlock>");
        broadcast(responseLatestMsg());
        console.log("end----------")
        return newBlock;
    }
    else {
        console.log("end----------")
        return null;
    }
}

/**
 * TODO: Implement a stop mechanism.
 * A current implementation doesn't stop until finding matching block.
 * 
 * TODO: Multi-threading (clustering)
 */
function findNonce(version, index, previoushash, timestamp, merkleRoot, difficulty) {
    console.log("start----------")
    console.log("[findNonce]");

    var nonce = 0;
    while (true) {
        var hash = SHA256([version, index, previoushash, timestamp, merkleRoot, difficulty, nonce]);
        if (hashMatchesDifficulty(hash, difficulty)) { 
            console.log("end-----------");
            return nonce; }
        nonce++;
    }
}

function hashMatchesDifficulty(hash, difficulty) {
    console.log("start----------")
    console.log("[hashMatchesDifficulty]");

    const hashBinary = hexToBinary(hash);
    console.log("<hashbinary>");
    console.dir(hashBinary);

    const requiredPrefix = '0'.repeat(difficulty);
    console.log("<requiredPrefix>");
    console.dir(requiredPrefix);

    console.log(hashBinary.startsWith(requiredPrefix));
    console.log("end-----------");
    return hashBinary.startsWith(requiredPrefix);
}

const BLOCK_GENERATION_INTERVAL = 10; // in seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // in blocks

function getDifficulty(aBlockchain) {
    console.log("start----------")
    console.log("[getDifficulty]");

    const latestBlock = aBlockchain.latestBlock();
    console.log("<latestBlock>");
    console.dir(latestBlock);

    if (latestBlock.header.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.header.index !== 0) {
        console.log("<getAdjsut>");
        console.log("end-----------");
        return getAdjustedDifficulty(aBlockchain);
    }
    console.log(latestBlock.header.difficulty);
    console.log("end-----------");
    return latestBlock.header.difficulty;
}

function getAdjustedDifficulty(aBlockchain) {
    console.log("start----------")
    console.log("[getAdjusteddifficult]");
    
    const latestBlock = aBlockchain.latestBlock();
    console.log("<latestBlock>");
    console.dir(latestBlock);

    const prevAdjustmentBlock = aBlockchain.indexWith(aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL);
    console.log("<prevAdjust>");
    console.dir(prevAdjustmentBlock);

    const timeTaken = latestBlock.header.timestamp - prevAdjustmentBlock.header.timestamp;
    console.log("<timetaken>");
    console.dir(timeTaken);

    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    console.log("<timeExpected>");
    console.dir(timeExpected);

    if (timeTaken < timeExpected / 2) {
        console.log("<preadjust+1>");
        console.log(prevAdjustmentBlock.header.difficulty + 1);
        console.log("end-----------");
        return prevAdjustmentBlock.header.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        console.log("<preadjust-1>");
        console.log(prevAdjustmentBlock.header.difficulty - 1);
        console.log("end-----------");
        return prevAdjustmentBlock.header.difficulty - 1;
    }
    else {
        console.log("preadjust0");
        console.log(prevAdjustmentBlock.header.difficulty);
        console.log("end-----------");
        return prevAdjustmentBlock.header.difficulty;
    }
}

function isValidBlockStructure(block) {
    console.log("start----------")
    console.log("[getAdjusteisValidBlockStructureddifficult]");
    console.log("<isValid>");

    console.log(typeof (block.header.version) === 'string'
    && typeof (block.header.index) === 'number'
    && typeof (block.header.previousHash) === 'string'
    && typeof (block.header.timestamp) === 'number'
    && typeof (block.header.merkleRoot) === 'string'
    && typeof (block.header.difficulty) === 'number'
    && typeof (block.header.nonce) === 'number'
    && typeof (block.data) === 'object');

    console.log("end----------")

    return typeof (block.header.version) === 'string'
        && typeof (block.header.index) === 'number'
        && typeof (block.header.previousHash) === 'string'
        && typeof (block.header.timestamp) === 'number'
        && typeof (block.header.merkleRoot) === 'string'
        && typeof (block.header.difficulty) === 'number'
        && typeof (block.header.nonce) === 'number'
        && typeof (block.data) === 'object';
}

function isValidTimestamp(newBlock, previousBlock) {
    console.log("start----------")
    console.log("[isValidTimestamp]");
    console.log("<isValidTimestamp>");

    console.dir((previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
    && newBlock.header.timestamp - 60 < getCurrentTimestamp());

    return (previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
        && newBlock.header.timestamp - 60 < getCurrentTimestamp();
}

function isValidNewBlock(newBlock, previousBlock) {
    console.log("start------------");
    console.log("[isValidblock]");

    if (!isValidBlockStructure(newBlock)) {
        console.log("Invalid block structure: " + JSON.stringify(newBlock));
        console.log("end------------");
        return false;
    }
    else if (previousBlock.header.index + 1 !== newBlock.header.index) {
        console.log("Invalid index");
        console.log("end------------");
        return false;
    }
    else if (previousBlock.hash() !== newBlock.header.previousHash) {
        console.log("Invalid previousHash");
        console.log("end------------");
        return false;
    }
    else if (calculateMerkleRoot(newBlock.data) !== newBlock.header.merkleRoot) {
        console.log("Invalid merkleRoot");
        console.log("end------------");
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('Invalid timestamp');
        console.log("end------------");
        return false;
    }
    else if (!hashMatchesDifficulty(newBlock.hash(), newBlock.header.difficulty)) {
        console.log("Invalid hash: " + newBlock.hash());
        console.log("end------------");
        return false;
    }
    return true;
}

function isValidChain(blockchainToValidate) {
    console.log("start------------");
    console.log("[isValidChain]");
    if (!deepEqual(blockchainToValidate.indexWith(0), getGenesisBlock())) {
        console.log("<doesnt Validstamp>");
        console.log("end------------");
        return false;
    }
    var tempBlockchain = new Blockchain([blockchainToValidate.indexWith(0)]);
    console.log("<tempblock>");
    console.dir(tempBlockchain);

    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate.indexWith(i), tempBlockchain.indexWith(i - 1))) {
            tempBlockchain.push(blockchainToValidate.indexWith(i));
            console.log("<validnew>");
            console.dir(tempBlockchain);

        }
        else { 
            console.log("end------------");
            return false; }
    }
    console.log("end------------");
    return true;
}

function isReplaceNeeded(originalBlockchain, newBlockchain) {
    /**
     * TODO: the haviest chain rule.
     * The current implementation is the longest chain rule.
     */
    console.log("start------------");
    console.log("[isReplaceNeeded]");
    if (originalBlockchain.length < newBlockchain.length) { 
        console.log("<lentgh-1>");
        console.dir(originalBlockchain.length < newBlockchain.length);
        console.log("end------------");
        return true; 
    }
    else if (originalBlockchain.length > newBlockchain.length) { 
        console.log("<lentgh+1>");
        console.dir(originalBlockchain.length > newBlockchain.length);
        console.log("end------------");
        return false; 
    }
    else { 
        console.log("<random>")
        console.log("end------------");
        return boolean(); 
    }
}

function replaceChain(newBlockchain) {
    console.log("start------------");
    console.log("[replaceChain]");
    if (isReplaceNeeded(blockchain, newBlockchain) && isValidChain(newBlockchain)) {
        console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");

        blockchain = deepCopy(newBlockchain);
        try { blockchain.save(); } catch (err) { throw err; }

        broadcast(responseLatestMsg());
    }
    else { console.log("Received blockchain invalid"); }
    console.log("end------------");

}

export default {
    initBlockchain,
    getBlockchain,
    getLatestBlock,
    addBlock,
    mineBlock,
    replaceChain
};

"use strict";
import { deepCopy, getCurrentVersion, getCurrentTimestamp, hexToBinary, deepEqual } from "./modules"; // utils
import { SHA256, calculateMerkleRoot } from "./modules"; // crypto
import { BlockHeader, Block, Blockchain } from "./modules"; // types
import { broadcast, responseLatestMsg } from "./modules"; // network

import { boolean } from "random";

var blockchain;

async function initBlockchain() {
    const loadedBlockchain = await new Blockchain().load();
    console.log("loadedBlock");
    console.dir(loadedBlockchain);

    if (loadedBlockchain !== undefined) {
        blockchain = loadedBlockchain;
    }
    else {
        const newBlockchain = new Blockchain([getGenesisBlock()]);
        console.dir(newBlockchain);

        try { newBlockchain.save(); } catch (err) { throw err; }
        blockchain = newBlockchain;
    }
    
    console.log("blockchain");
    console.dir(blockchain);
}

function getBlockchain() { 
    console.log("blockchain call");
    return deepCopy(blockchain); }
function getLatestBlock() { 
    console.log("lates call");
    return deepCopy(blockchain.latestBlock()); }

function generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data) {
    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce);
    console.log("header");
    console.dir(header);
    return new Block(header, data);
}

function generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data) {
    const merkleRoot = calculateMerkleRoot(data);
    console.log("header");
    console.dir(merkleRoot);
    return generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data);
}

function getGenesisBlock() {
    console.log("getgenesis");
    const version = "1.0.0";
    const index = 0;
    const previousHash = '0'.repeat(64);
    const timestamp = 1231006505; // 01/03/2009 @ 6:15pm (UTC)
    const difficulty = 0;
    const nonce = 0;
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"];

    return generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data);
}

function generateNextBlock(blockData) {
    console.log("next");
    const previousBlock = getLatestBlock();

    const currentVersion = getCurrentVersion();
    const nextIndex = previousBlock.header.index + 1;
    const previousHash = previousBlock.hash();
    const nextTimestamp = getCurrentTimestamp();
    const merkleRoot = calculateMerkleRoot(blockData);
    const difficulty = getDifficulty(getBlockchain());
    const validNonce = findNonce(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty);

    return generateRawBlock(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, validNonce, blockData);
}

function addBlock(newBlock) {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
        console.log("newblockchain");
        console.dir(blockchain);

        try { blockchain.save(); } catch (err) { throw err; }
        return true;
    }
    return false;
}

function mineBlock(blockData) {
    const newBlock = generateNextBlock(blockData);
    console.log("newBlock");
    console.dir(newBlock);

    if (addBlock(newBlock)) {
        console.log("add");
        broadcast(responseLatestMsg());
        return newBlock;
    }
    else {
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
    console.log("findNonce");

    var nonce = 0;
    while (true) {
        var hash = SHA256([version, index, previoushash, timestamp, merkleRoot, difficulty, nonce]);
        if (hashMatchesDifficulty(hash, difficulty)) { 
            console.log("end");
            return nonce; }
        nonce++;
    }
}

function hashMatchesDifficulty(hash, difficulty) {
    console.log("hashmatches");

    const hashBinary = hexToBinary(hash);
    console.log("hashbinary");
    console.dir(hashBinary);

    const requiredPrefix = '0'.repeat(difficulty);
    console.log("requiredPrefix");
    console.dir(requiredPrefix);

    return hashBinary.startsWith(requiredPrefix);
}

const BLOCK_GENERATION_INTERVAL = 10; // in seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // in blocks

function getDifficulty(aBlockchain) {
    console.log("getDifficulty");

    const latestBlock = aBlockchain.latestBlock();
    console.log("latestBlock");
    console.dir(latestBlock);

    if (latestBlock.header.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.header.index !== 0) {
        console.log("getadjusted");
        return getAdjustedDifficulty(aBlockchain);
    }
    return latestBlock.header.difficulty;
}

function getAdjustedDifficulty(aBlockchain) {
    console.log("getAdjusteddifficult");
    
    const latestBlock = aBlockchain.latestBlock();
    console.log("latestBlock");
    console.dir(latestBlock);

    const prevAdjustmentBlock = aBlockchain.indexWith(aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL);
    console.log("prevAdjust");
    console.dir(prevAdjustmentBlock);

    const timeTaken = latestBlock.header.timestamp - prevAdjustmentBlock.header.timestamp;
    console.log("timetaken");
    console.dir(timeTaken);

    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    console.log("timeExpected");
    console.dir(timeExpected);

    if (timeTaken < timeExpected / 2) {
        console.log("preadjust+1");
        return prevAdjustmentBlock.header.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        console.log("preadjust-1");
        return prevAdjustmentBlock.header.difficulty - 1;
    }
    else {
        console.log("preadjust0");
        return prevAdjustmentBlock.header.difficulty;
    }
}

function isValidBlockStructure(block) {
    console.log("isValid");

    console.log(typeof (block.header.version) === 'string'
    && typeof (block.header.index) === 'number'
    && typeof (block.header.previousHash) === 'string'
    && typeof (block.header.timestamp) === 'number'
    && typeof (block.header.merkleRoot) === 'string'
    && typeof (block.header.difficulty) === 'number'
    && typeof (block.header.nonce) === 'number'
    && typeof (block.data) === 'object');

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
    console.log("isValidstamp");

    console.dir((previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
    && newBlock.header.timestamp - 60 < getCurrentTimestamp());

    return (previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
        && newBlock.header.timestamp - 60 < getCurrentTimestamp();
}

function isValidNewBlock(newBlock, previousBlock) {
    console.log("isValidblock");

    if (!isValidBlockStructure(newBlock)) {
        console.log("Invalid block structure: " + JSON.stringify(newBlock));
        return false;
    }
    else if (previousBlock.header.index + 1 !== newBlock.header.index) {
        console.log("Invalid index");
        return false;
    }
    else if (previousBlock.hash() !== newBlock.header.previousHash) {
        console.log("Invalid previousHash");
        return false;
    }
    else if (calculateMerkleRoot(newBlock.data) !== newBlock.header.merkleRoot) {
        console.log("Invalid merkleRoot");
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('Invalid timestamp');
        return false;
    }
    else if (!hashMatchesDifficulty(newBlock.hash(), newBlock.header.difficulty)) {
        console.log("Invalid hash: " + newBlock.hash());
        return false;
    }
    return true;
}

function isValidChain(blockchainToValidate) {
    if (!deepEqual(blockchainToValidate.indexWith(0), getGenesisBlock())) {
        console.log("doesnt Validstamp");
        console.dir(!deepEqual(blockchainToValidate.indexWith(0), getGenesisBlock()));

        return false;
    }
    var tempBlockchain = new Blockchain([blockchainToValidate.indexWith(0)]);
    console.log("tempblock");
    console.dir(tempBlockchain);

    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate.indexWith(i), tempBlockchain.indexWith(i - 1))) {
            tempBlockchain.push(blockchainToValidate.indexWith(i));
            console.log("validnew");
            console.dir(tempBlockchain);

        }
        else { return false; }
    }
    return true;
}

function isReplaceNeeded(originalBlockchain, newBlockchain) {
    /**
     * TODO: the haviest chain rule.
     * The current implementation is the longest chain rule.
     */

    if (originalBlockchain.length < newBlockchain.length) { 
        console.log("lentgh-1");
        console.dir(originalBlockchain.length < newBlockchain.length);

        return true; }
    else if (originalBlockchain.length > newBlockchain.length) { 
        console.log("lentgh+1");
        console.dir(originalBlockchain.length > newBlockchain.length);
        return false; }
    else { return boolean(); }
}

function replaceChain(newBlockchain) {
    if (isReplaceNeeded(blockchain, newBlockchain) && isValidChain(newBlockchain)) {
        console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");

        blockchain = deepCopy(newBlockchain);
        try { blockchain.save(); } catch (err) { throw err; }

        broadcast(responseLatestMsg());
    }
    else { console.log("Received blockchain invalid"); }
}

export default {
    initBlockchain,
    getBlockchain,
    getLatestBlock,
    addBlock,
    mineBlock,
    replaceChain
};

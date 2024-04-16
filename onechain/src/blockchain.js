"use strict";
import { logger } from "./logger";
import { deepCopy, getCurrentVersion, getCurrentTimestamp, hexToBinary, deepEqual } from "./modules"; // utils
import { SHA256, calculateMerkleRoot } from "./modules"; // crypto
import { BlockHeader, Block, Blockchain } from "./modules"; // types
import { broadcast, responseLatestMsg } from "./modules"; // network

import { boolean } from "random";

const fileName = "blockchain.js";

var blockchain;

async function initBlockchain() {
    const functionName = "initBlockchain";
    logger.log({level: 'info', message : 'initalize load Blockchain', fileN : fileName, functionN:functionName});

    const loadedBlockchain = await new Blockchain().load();

    if (loadedBlockchain !== undefined) {
        logger.log({level: 'info', message : "loadblock defined", fileN : fileName, functionN:functionName});
        blockchain = loadedBlockchain;
    }
    else {
        logger.log({level: 'info', message : "loadblock undefined", fileN : fileName, functionN:functionName});

        const newBlockchain = new Blockchain([getGenesisBlock()]);

        try { newBlockchain.save(); } 
        catch (err) { 
            logger.log({level: 'info', message : "init save err", fileN : fileName, functionN:functionName});
            throw err; }
        blockchain = newBlockchain;
    }
    
    logger.log({level: 'info', message : JSON.stringify(blockchain), fileN : fileName, functionN:functionName});

   
}

function getBlockchain() { 
    const functionName = "getBlockchain";
    logger.log({level: 'info', message : 'get Blockchain', fileN : fileName, functionN:functionName});
   
    return deepCopy(blockchain); 
}

function getLatestBlock() { 
    const functionName = "getLatestBlock";
    logger.log({level: 'info', message : 'get LatestBlock', fileN : fileName, functionN:functionName});
   
    return deepCopy(blockchain.latestBlock()); 
}

function generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data) {
    
    const functionName = "generateRawBlock";
    logger.log({level: 'info', message : 'generateRawBlock', fileN : fileName, functionN:functionName});

    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce);

    return new Block(header, data);
}

function generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data) {
    
    const functionName = "generateBlock";
    logger.log({level: 'info', message : 'generateBlock', fileN : fileName, functionN:functionName});

    const merkleRoot = calculateMerkleRoot(data);

    return generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data);
}

function getGenesisBlock() {
    
    const functionName = "getGenesisBlock";
    logger.log({level: 'info', message : 'get GenesisBlock', fileN : fileName, functionN:functionName});

    const version = "1.0.0";
    const index = 0;
    const previousHash = '0'.repeat(64);
    const timestamp = 1231006505; // 01/03/2009 @ 6:15pm (UTC)
    const difficulty = 1;
    const nonce = 0;
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"];

    return generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data);
}

function generateNextBlock(blockData) {

    const functionName = "generateNextBlock";
    logger.log({level: 'info', message : 'generate Nextblock', fileN : fileName, functionN:functionName});

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
    
    const functionName = "addBlock";
    logger.log({level: 'info', message : "addBlock function", fileN : fileName, functionN:functionName}); 

    if (isValidNewBlock(newBlock, getLatestBlock())) {
        logger.log({level: 'info', message : "is valid block", fileN : fileName, functionN:functionName}); 

        blockchain.push(newBlock);
        logger.log({level: 'info', message : JSON.stringify(blockchain), fileN : fileName, functionN:functionName}); 

        try { 
            logger.log({level: 'info', message : 'add save', fileN : fileName, functionN:functionName}); 
            blockchain.save(); } 
        catch (err) {
            logger.log({level: 'info', message : "add save err", fileN : fileName, functionN:functionName}); 
            throw err; }
        return true;
    }
    return false;
}

function mineBlock(blockData) {
    const functionName = "mineBlock";
    logger.log({level: 'info', message : "mineBlock function", fileN : fileName, functionN:functionName}); 
    const newBlock = generateNextBlock(blockData);

    if (addBlock(newBlock)) {
        logger.log({level: 'info', message : "mineblock addblock true", fileN : fileName, functionN:functionName}); 

        broadcast(responseLatestMsg());
        return newBlock;
    }
    else {
        logger.log({level: 'info', message : "mineblock err", fileN : fileName, functionN:functionName}); 
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

    const functionName = "findNonce";

    var nonce = 0;
    while (true) {
        var hash = SHA256([version, index, previoushash, timestamp, merkleRoot, difficulty, nonce]);
        if (hashMatchesDifficulty(hash, difficulty)) { 
            logger.log({level: 'info', message : nonce, fileN : fileName, functionN:functionName});
            return nonce; }
        nonce++;
    }
}

function hashMatchesDifficulty(hash, difficulty) {
    const functionName = "hashMatchesDifficulty";
    logger.log({level: 'info', message : 'hashMatchesDifficulty', fileN : fileName, functionN:functionName});

    const hashBinary = hexToBinary(hash);

    const requiredPrefix = '0'.repeat(difficulty);
    logger.log({level: 'info', message : requiredPrefix, fileN : fileName, functionN:functionName});

    const trufalse = hashBinary.startsWith(requiredPrefix)
    logger.log({level: 'info', message : JSON.stringify(trufalse), fileN : fileName, functionN:functionName});

    return trufalse;
}

const BLOCK_GENERATION_INTERVAL = 10; // in seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // in blocks

function getDifficulty(aBlockchain) {
    const functionName = "getDifficulty";
    logger.log({level: 'info', message : 'getDifficulty', fileN : fileName, functionN:functionName});

    const latestBlock = aBlockchain.latestBlock();

    if (latestBlock.header.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.header.index !== 0) {
        logger.log({level: 'info', message : 'let adjusted difficulty', fileN : fileName, functionN:functionName});
        return getAdjustedDifficulty(aBlockchain);
    }
    logger.log({level: 'info', message : JSON.stringify(latestBlock.header.difficulty), fileN : fileName, functionN:functionName});
    return latestBlock.header.difficulty;
}

function getAdjustedDifficulty(aBlockchain) {
    const functionName = "getDifficulty";
    logger.log({level: 'info', message : 'getDifficulty', fileN : fileName, functionN:functionName});

    const latestBlock = aBlockchain.latestBlock();

    const prevAdjustmentBlock = aBlockchain.indexWith(aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL);

    const timeTaken = latestBlock.header.timestamp - prevAdjustmentBlock.header.timestamp;
    logger.log({level: 'info', message : timeTaken, fileN : fileName, functionN:functionName});

    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    logger.log({level: 'info', message : timeExpected, fileN : fileName, functionN:functionName});


    if (timeTaken < timeExpected / 2) {
        logger.log({level: 'info', message : 'difficulty+1', fileN : fileName, functionN:functionName});
        return prevAdjustmentBlock.header.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        logger.log({level: 'info', message : 'difficulty-1', fileN : fileName, functionN:functionName});
        return prevAdjustmentBlock.header.difficulty - 1;
    }
    else {
        logger.log({level: 'info', message : 'difficulty+0', fileN : fileName, functionN:functionName});
        return prevAdjustmentBlock.header.difficulty;
    }
}

function isValidBlockStructure(block) {
    const functionName = "isValidBlockStructure";

    logger.log({level: 'info', message : 'isValidBlockStructure', fileN : fileName, functionN:functionName});

    const trualse = (typeof (block.header.version) === 'string'
    && typeof (block.header.index) === 'number'
    && typeof (block.header.previousHash) === 'string'
    && typeof (block.header.timestamp) === 'number'
    && typeof (block.header.merkleRoot) === 'string'
    && typeof (block.header.difficulty) === 'number'
    && typeof (block.header.nonce) === 'number'
    && typeof (block.data) === 'object');

    logger.log({level: 'info', message : trualse, fileN : fileName, functionN:functionName});

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
    const functionName = "isValidTimestamp";
    logger.log({level: 'info', message :'isValidTimestamp', fileN : fileName, functionN:functionName});


    const vl = (previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
    && newBlock.header.timestamp - 60 < getCurrentTimestamp()

    logger.log({level: 'info', message : vl, fileN : fileName, functionN:functionName});

    return (previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
        && newBlock.header.timestamp - 60 < getCurrentTimestamp();
}

function isValidNewBlock(newBlock, previousBlock) {
    const functionName = "isValidNewBlock";
    logger.log({level: 'info', message : 'check validNewblock', fileN : fileName, functionN:functionName});

    if (!isValidBlockStructure(newBlock)) {
        logger.log({level: 'info', message : 'Invalid block structure', fileN : fileName, functionN:functionName});

        const ne = JSON.stringify(newBlock);
        logger.log({level: 'info', message : ne, fileN : fileName, functionN:functionName});

        return false;
    }
    else if (previousBlock.header.index + 1 !== newBlock.header.index) {
        logger.log({level: 'info', message : 'Invalid index', fileN : fileName, functionN:functionName});
        return false;
    }
    else if (previousBlock.hash() !== newBlock.header.previousHash) {
        logger.log({level: 'info', message : 'Invalid previousHash', fileN : fileName, functionN:functionName});
        return false;
    }
    else if (calculateMerkleRoot(newBlock.data) !== newBlock.header.merkleRoot) {
        logger.log({level: 'info', message : 'Invalid merkleRoot', fileN : fileName, functionN:functionName});
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        logger.log({level: 'info', message : 'Invalid timestamp', fileN : fileName, functionN:functionName});
        return false;
    }
    else if (!hashMatchesDifficulty(newBlock.hash(), newBlock.header.difficulty)) {
        logger.log({level: 'info', message : 'Invalid hash', fileN : fileName, functionN:functionName});
        return false;
    }
    return true;
}

function isValidChain(blockchainToValidate) {
    const functionName = "isValidChain";
    logger.log({level: 'info', message : 'isValidChain', fileN : fileName, functionN:functionName});


    if (!deepEqual(blockchainToValidate.indexWith(0), getGenesisBlock())) {
        logger.log({level: 'info', message : 'doesnt Validstamp', fileN : fileName, functionN:functionName});
        return false;
    }
    var tempBlockchain = new Blockchain([blockchainToValidate.indexWith(0)]);
    logger.log({level: 'info', message : JSON.stringify(tempBlockchain), fileN : fileName, functionN:functionName});


    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate.indexWith(i), tempBlockchain.indexWith(i - 1))) {
            tempBlockchain.push(blockchainToValidate.indexWith(i));
            logger.log({level: 'info', message : 'valid block push', fileN : fileName, functionN:functionName});
        }
        else { 
            logger.log({level: 'info', message : 'invalid blockchain', fileN : fileName, functionN:functionName});
            return false; }
    }
    logger.log({level: 'info', message : 'valid blockchain', fileN : fileName, functionN:functionName});
    return true;
}

function isReplaceNeeded(originalBlockchain, newBlockchain) {
    /**
     * TODO: the haviest chain rule.
     * The current implementation is the longest chain rule.
     */
    const functionName = "isReplaceNeeded";
    logger.log({level: 'info', message : 'isReplaceNeeded', fileN : fileName, functionN:functionName});


    if (originalBlockchain.length < newBlockchain.length) { 
        logger.log({level: 'info', message : 'need replace', fileN : fileName, functionN:functionName});
        return true; 
    }
    else if (originalBlockchain.length > newBlockchain.length) { 
        logger.log({level: 'info', message : 'not need replace', fileN : fileName, functionN:functionName});
        return false; 
    }
    else { 
        logger.log({level: 'info', message : 'need random', fileN : fileName, functionN:functionName});
        return boolean(); 
    }
}

function replaceChain(newBlockchain) {
    const functionName = "replaceChain";
    logger.log({level: 'info', message : 'replaceChain', fileN : fileName, functionN:functionName});


    if (isReplaceNeeded(blockchain, newBlockchain) && isValidChain(newBlockchain)) {
        logger.log({level: 'info', message : 'Received blockchain is valid. Replacing current blockchain with received blockchain', fileN : fileName, functionN:functionName});
        blockchain = deepCopy(newBlockchain);
        try { 
            logger.log({level: 'info', message : 'replaceChain save', fileN : fileName, functionN:functionName});
            blockchain.save(); } 
        catch (err) { 
            logger.log({level: 'info', message : "replcae save err", fileN : fileName, functionN:functionName});
            throw err; }

        broadcast(responseLatestMsg());
    }
    else { 
        logger.log({level: 'info', message : 'Received blockchain invalid', fileN : fileName, functionN:functionName});
    }
}

export default {
    initBlockchain,
    getBlockchain,
    getLatestBlock,
    addBlock,
    mineBlock,
    replaceChain
};

"use strict";
import { logger } from "./logger";
import { deepCopy } from "./modules"; // utils
import { SHA256 } from "./modules"; // crypto
import { db } from "./modules"; // database

const fileName = "types.js";

class BlockHeader {
    constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce) {

        this.version = version;
        this.index = index;
        this._previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.difficulty = difficulty;
        this.nonce = nonce;

        const functionName = "blockHeader";
        logger.log({level: 'info', message : 'new BlockHeader', fileN : fileName, functionN:functionName});
    }

    get previousHash() {
        return this._previousHash.toUpperCase(); // always return upper case letters.
    }

    /**
     * @param {string} newPreviousHash
     */
    set previousHash(newPreviousHash) {
        this._previousHash = newPreviousHash;
    }

    hash() {
        const functionName = "blockHeader/hash";
        logger.log({level: 'info', message : 'hash', fileN : fileName, functionN:functionName});

        const hashValue = (SHA256([
            this.version,
            this.index,
            this.previousHash,
            this.timestamp,
            this.merkleRoot,
            this.difficulty,
            this.nonce
        ]));

        logger.log({level: 'info', message : hashValue, fileN : fileName, functionN:functionName});

        return SHA256([
            this.version,
            this.index,
            this.previousHash,
            this.timestamp,
            this.merkleRoot,
            this.difficulty,
            this.nonce
        ]);
    }
}

class Block {
    constructor(header, data) {
        const functionName = "block/new";
        logger.log({level: 'info', message : 'new block', fileN : fileName, functionN:functionName});

        this.header = deepCopy(header);
        this.data = deepCopy(data);

    }

    hash() {

        const functionName = "block/hash";
        logger.log({level: 'info', message : 'get blockHeader hash', fileN : fileName, functionN:functionName});
        
        return this.header.hash();
    }

    encode() {
        const functionName = "block/encode";
        logger.log({level: 'info', message : 'encode', fileN : fileName, functionN:functionName});

        const endoevli = JSON.stringify(this);
        logger.log({level: 'info', message : endoevli, fileN : fileName, functionN:functionName});
        
        return JSON.stringify(this);
    }

    decode(encodedBlock) {
        const functionName = "block/decode";
        logger.log({level: 'info', message : 'decode', fileN : fileName, functionN:functionName});

        const decodedBlock = JSON.parse(encodedBlock);
        logger.log({level: 'info', message : JSON.stringify(decodedBlock), fileN : fileName, functionN:functionName});

        const objectifiedBlock = Object.assign(new Block(), decodedBlock);
        logger.log({level: 'info', message : JSON.stringify(objectifiedBlock), fileN : fileName, functionN:functionName});

        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header);
        logger.log({level: 'info', message : JSON.stringify(decodedBlock.header), fileN : fileName, functionN:functionName});

        return objectifiedBlock;
    }
}

class Blockchain {
    constructor(blocks) {
        const functionName = "Blockchain";
        logger.log({level: 'info', message : "new Blockchain", fileN : fileName, functionN:functionName});

        this._blocks = deepCopy(blocks);
        try { this._length = this.blocks.length; } 
        catch (err) {  
            logger.log({level: 'info', message : "blockchin length err", fileN : fileName, functionN:functionName});
            console.log(err);  } // for decode()
    }

    get blocks() {
        return this._blocks;
    }

    get length() {
        return this._length;
    }

    push(newBlock) {
        const functionName = "Blockchain/push";
        logger.log({level: 'info', message : 'push new block', fileN : fileName, functionN:functionName});

        this.blocks.push(newBlock);
        this._length = this.blocks.length;

    }

    indexWith(index) {

        const functionName = "Blockchain/indexWith";
        logger.log({level: 'info', message : "indexWith", fileN : fileName, functionN:functionName});

        if (index >= this.length || index < (-1) * this.length) { throw RangeError(); }

        if (index < 0) { 
            logger.log({level: 'info', message : JSON.stringify(this.blocks[this.length + index]), fileN : fileName, functionN:functionName});

            return this.blocks[this.length + index]; }

        else { 
            logger.log({level: 'info', message : JSON.stringify(this.blocks[index]), fileN : fileName, functionN:functionName});

            return this.blocks[index]; }
    }

    latestBlock() {
        const functionName = "Blockchain/latestBlock";
        logger.log({level: 'info', message : 'get latestBlock', fileN : fileName, functionN:functionName});

        return this.indexWith(-1);
    }

    latestBlockHash() {
        const functionName = "Blockchain/latestBlockHash";
        logger.log({level: 'info', message : 'get latestBlockHash', fileN : fileName, functionN:functionName});

        return this.latestBlock().hash();
    }

    encode() {
        const encoedblock = JSON.stringify(this)
        const functionName = "Blockchain/encode";
        logger.log({level: 'info', message : encoedblock, fileN : fileName, functionN:functionName});
        return encoedblock;
    }

    decode(encodedBlockchain) {
        const functionName = "Blockchain/decode";
        logger.log({level: 'info', message : "decode", fileN : fileName, functionN:functionName});

        const decodedBlockchain = JSON.parse(encodedBlockchain);
        logger.log({level: 'info', message : JSON.stringify(decodedBlockchain), fileN : fileName, functionN:functionName});

        const objectifiedBlockchain = Object.assign(new Blockchain(), decodedBlockchain);
        logger.log({level: 'info', message : JSON.stringify(objectifiedBlockchain), fileN : fileName, functionN:functionName});

        const decodedBlocks = objectifiedBlockchain.blocks.map(function (encodedBlock) {
            /**
             * TODO: optimization.
             * Meaningless repetition of JSON.stringify and JSON.parse in Block().decode()
             */
            return new Block().decode(JSON.stringify(encodedBlock));
        });

        logger.log({level: 'info', message : JSON.stringify(decodedBlocks), fileN : fileName, functionN:functionName});

        return new Blockchain(decodedBlocks);
    }

    async save() {
        const functionName = "Blockchain/save";
        logger.log({level: 'info', message : "save", fileN : fileName, functionN:functionName});

        const encodedBlockchain = this.encode();
        logger.log({level: 'info', message : encodedBlockchain, fileN : fileName, functionN:functionName});

        try { 
            await db.put("Blockchain", encodedBlockchain);
            logger.log({level: 'info', message : "BlockChain-save", fileN : fileName, functionN:functionName});

        }
        catch (err) { 
            logger.log({level: 'info', message : "save err", fileN : fileName, functionN:functionName});
            throw err; }

    }

    async load() {
        const functionName = "Blockchain/load";
        logger.log({level: 'info', message : "load", fileN : fileName, functionN:functionName});

        try {
            const encodedBlockchain = await db.get("Blockchain");
            logger.log({level: 'info', message : JSON.stringify(encodedBlockchain), fileN : fileName, functionN:functionName});

            return new Blockchain().decode(encodedBlockchain);
        }
        catch (err) {
            logger.log({level: 'info', message : "load err", fileN : fileName, functionN:functionName});
            return undefined;
        }
    }
}

export default {
    BlockHeader,
    Block,
    Blockchain
};

"use strict";
import { deepCopy } from "./modules"; // utils
import { SHA256 } from "./modules"; // crypto
import { db } from "./modules"; // database

class BlockHeader {
    constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce) {
        this.version = version;
        this.index = index;
        this._previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.difficulty = difficulty;
        this.nonce = nonce;
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
        this.header = deepCopy(header);
        this.data = deepCopy(data);
    }

    hash() {
        return this.header.hash();
    }

    encode() {
        return JSON.stringify(this);
    }

    decode(encodedBlock) {
        var decodedBlock = JSON.parse(encodedBlock);
        console.log("decodedBlcok");
        console.dir(decodedBlock);

        var objectifiedBlock = Object.assign(new Block(), decodedBlock);
        console.log("objectifiedBlock");
        console.dir(objectifiedBlock);

        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header);
        console.log("objectifiedBlockHeader");
        console.dir(objectifiedBlock.header);

        return objectifiedBlock;
    }
}

class Blockchain {
    constructor(blocks) {
        this._blocks = deepCopy(blocks);
        try { this._length = this.blocks.length; } catch (err) {  console.log(err);  } // for decode()
    }

    get blocks() {
        return this._blocks;
    }

    get length() {
        return this._length;
    }

    push(newBlock) {
        this.blocks.push(newBlock);
        console.log("this block");
        console.dir(this.blocks);

        this._length = this.blocks.length;
        console.log("lenthg");
        console.dir(this._length);
    }

    indexWith(index) {
        console.log("index");
        if (index >= this.length || index < (-1) * this.length) { throw RangeError(); }

        if (index < 0) { return this.blocks[this.length + index]; }
        else { return this.blocks[index]; }
    }

    latestBlock() {
        console.log("latest");
        return this.indexWith(-1);
    }

    latestBlockHash() {
        console.log("latestblock");
        return this.latestBlock().hash();
    }

    encode() {
        console.log("encode : " +JSON.stringify(this));
        return JSON.stringify(this);
    }

    decode(encodedBlockchain) {
        var decodedBlockchain = JSON.parse(encodedBlockchain);
        console.log("decodedBlcokchain");
        console.dir(decodedBlockchain);

        var objectifiedBlockchain = Object.assign(new Blockchain(), decodedBlockchain);
        console.log("objectifiedBlockchain");
        console.dir(objectifiedBlockchain);

        var decodedBlocks = objectifiedBlockchain.blocks.map(function (encodedBlock) {
            /**
             * TODO: optimization.
             * Meaningless repetition of JSON.stringify and JSON.parse in Block().decode()
             */
            return new Block().decode(JSON.stringify(encodedBlock));
        });

        return new Blockchain(decodedBlocks);
    }

    async save() {
        const encodedBlockchain = this.encode();
        console.dir(encodedBlockchain);

        try { 
            const putdb = await db.put("Blockchain", encodedBlockchain);

            console.log("db : "+ db);
            console.dir(putdb); 
            console.log("save");
        }
        catch (err) { throw err; }

        console.log("finish save");
    }

    async load() {
        console.log("start load");
        try {
            const encodedBlockchain = await db.get("Blockchain");
            console.log("encodeBlcok");
            console.dir(encodedBlockchain);
            
            return new Blockchain().decode(encodedBlockchain);
        }
        catch (err) {
            return undefined;
        }
    }
}

export default {
    BlockHeader,
    Block,
    Blockchain
};

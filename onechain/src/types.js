"use strict";
import { deepCopy } from "./modules"; // utils
import { SHA256 } from "./modules"; // crypto
import { db } from "./modules"; // database

class BlockHeader {
    constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce) {
        console.log("start----------")
        console.log("[blockHeader]");
        this.version = version;
        this.index = index;
        this._previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.difficulty = difficulty;
        this.nonce = nonce;
        console.log("start----------")
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
        console.log("start----------");
        console.log("[hash]");
        console.log("<hash>");
        console.dir(SHA256([
            this.version,
            this.index,
            this.previousHash,
            this.timestamp,
            this.merkleRoot,
            this.difficulty,
            this.nonce
        ]));
        console.log("end--------");
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
        console.log("start----------")
        console.log("[Block]");
        this.header = deepCopy(header);
        this.data = deepCopy(data);
        console.log("end----------")
    }

    hash() {
        console.log("start----------");
        console.log("[Header hash]");
        return this.header.hash();
    }

    encode() {
        console.log("start----------");
        console.log("[blockencode]");
        console.log("<encode>");
        console.dir(JSON.stringify(this));
        console.log("end--------");
        return JSON.stringify(this);
    }

    decode(encodedBlock) {
        console.log("start----------")
        console.log("[blockdecode]");
        var decodedBlock = JSON.parse(encodedBlock);
        console.log("<decodedBlcok>");
        console.dir(decodedBlock);

        var objectifiedBlock = Object.assign(new Block(), decodedBlock);
        console.log("<objectifiedBlock>");
        console.dir(objectifiedBlock);

        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header);
        console.log("<objectifiedBlockHeader>");
        console.dir(objectifiedBlock.header);
        console.log("<objectfiedblock>");
        console.dir(objectifiedBlock);
        console.log("end----------");

        return objectifiedBlock;
    }
}

class Blockchain {
    constructor(blocks) {
        console.log("start---------")
        console.log("[Blockchain]");
        this._blocks = deepCopy(blocks);
        try { this._length = this.blocks.length; } catch (err) {  console.log(err);  } // for decode()
        console.log("end---------")
    }

    get blocks() {
        return this._blocks;
    }

    get length() {
        return this._length;
    }

    push(newBlock) {
        console.log("start---------");
        console.log("[push]");
        console.log("<this blocks>");
        console.dir(this.blocks);
        console.log("<newBlock>");
        console.dir(newBlock);
        
        console.log("<pushNewBlcok -> this blocks>");
        console.dir(this.blocks.push(newBlock));

        this._length = this.blocks.length;
        console.log("<lenthg>");
        console.dir(this._length);
        console.log("end----------");
    }

    indexWith(index) {
        console.log("start---------");
        console.log("[indexWith]");
        console.log("<index>");
        if (index >= this.length || index < (-1) * this.length) { throw RangeError(); }

        if (index < 0) { 
            console.dir(this.blocks[this.length + index]);
            console.log("end----------");
            return this.blocks[this.length + index]; }

        else { 
            console.dir(this.blocks[index])
            console.log("end----------");
            return this.blocks[index]; }
    }

    latestBlock() {
        console.log("start---------");
        console.log("[latestBlcok]");
        console.log("end----------");
        return this.indexWith(-1);
    }

    latestBlockHash() {
        console.log("start---------");
        console.log("[latestBlockHash]");
        console.log("end----------");
        return this.latestBlock().hash();
    }

    encode() {
        console.log("start---------");
        console.log("[blockchainencode]");
        console.log("<encode>");
        const encoedblock = JSON.stringify(this)
        console.dir(encoedblock);
        console.log("end----------");
        return encoedblock;
    }

    decode(encodedBlockchain) {
        console.log("start---------");
        console.log("[BlockChaindecode]");
        var decodedBlockchain = JSON.parse(encodedBlockchain);
        console.log("<decodedBlcokchain>");
        console.dir(decodedBlockchain);

        var objectifiedBlockchain = Object.assign(new Blockchain(), decodedBlockchain);
        console.log("<objectifiedBlockchain>");
        console.dir(objectifiedBlockchain);

        var decodedBlocks = objectifiedBlockchain.blocks.map(function (encodedBlock) {
            /**
             * TODO: optimization.
             * Meaningless repetition of JSON.stringify and JSON.parse in Block().decode()
             */
            return new Block().decode(JSON.stringify(encodedBlock));
        });

        console.log("<decodeBlocks>");
        console.dir(decodedBlocks);
        console.log("end----------");

        return new Blockchain(decodedBlocks);
    }

    async save() {
        console.log("start----------");
        console.log("[save]")
        const encodedBlockchain = this.encode();
        console.log("<endcodeBlockchain>");
        console.dir(encodedBlockchain);

        try { 
            const putdb = await db.put("Blockchain", encodedBlockchain);

            console.log("<db> : "+ db);
            console.dir(putdb); 
            console.log("<save>");
        }
        catch (err) { throw err; }

        console.log("end----------");
    }

    async load() {
        console.log("start----------");
        console.log("[load]");
        try {
            const encodedBlockchain = await db.get("Blockchain");
            console.log("<encodeBlcok>");
            console.dir(encodedBlockchain);
            console.log("end----------");
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

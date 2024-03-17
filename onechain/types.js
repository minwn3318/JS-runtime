"use strict";
import { deepCopy } from "./modules"; // utils
import { SHA256 } from "./modules"; // crypto
import { db } from "./modules"; // database

class BlockHeader { //블록헤더
    constructor(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce) {
        this.version = version;
        this.index = index;
        this._previousHash = previousHash;
        this.timestamp = timestamp;
        this.merkleRoot = merkleRoot;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    get previousHash() { //(get)이전 해시를 갖기(자바스크립트 _)(get, set)
        return this._previousHash.toUpperCase(); // always return upper case letters.
    }

    /**
     * @param {string} newPreviousHash
     */
    set previousHash(newPreviousHash) { //새로운 해시를 받았을 때, 새로운 해시를 이전 해시로 취긓ㅂ한다
        this._previousHash = newPreviousHash;
    }

    hash() { //해시 값 만들기
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

class Block { //블록헤더와 블록데이터 내용 사용하기
    constructor(header, data) {
        this.header = deepCopy(header); //헤더 내용을 사용하기(deepclone 사용이유)
        this.data = deepCopy(data);
    }

    hash() { //해시값 얻기
        return this.header.hash();
    }

    encode() { //인코드 제이슨 문자열로 변환
        return JSON.stringify(this);
    }

    decode(encodedBlock) { //디코드 복원
        var decodedBlock = JSON.parse(encodedBlock);
        var objectifiedBlock = Object.assign(new Block(), decodedBlock);///(assign)
        objectifiedBlock.header = Object.assign(new BlockHeader(), objectifiedBlock.header);
        return objectifiedBlock;
    }
}

class Blockchain { //블록체인
    constructor(blocks) { //블록 구조 얻기
        this._blocks = deepCopy(blocks);
        try { this._length = this.blocks.length; } catch (err) { /* console.log(err); */ } // for decode()
    }

    get blocks() {//블록 구하기
        return this._blocks;
    }

    get length() { //길이
        return this._length;
    }

    push(newBlock) {
        this.blocks.push(newBlock); //블록 더하기
        this._length = this.blocks.length;
    }

    indexWith(index) {//에러 발생 감지
        if (index >= this.length || index < (-1) * this.length) { throw RangeError(); }

        if (index < 0) { return this.blocks[this.length + index]; } //인덱스 가 맞다면 해당 인덱스 반환
        else { return this.blocks[index]; }
    }

    latestBlock() { //최근 블록 감지
        return this.indexWith(-1);
    }

    latestBlockHash() { //최근 블록 해시 얻기
        return this.latestBlock().hash();
    }

    encode() { //인코드 얻기
        return JSON.stringify(this);
    }

    decode(encodedBlockchain) { //디코드 얻기
        var decodedBlockchain = JSON.parse(encodedBlockchain);
        var objectifiedBlockchain = Object.assign(new Blockchain(), decodedBlockchain);

        var decodedBlocks = objectifiedBlockchain.blocks.map(function (encodedBlock) {
            /**
             * TODO: optimization.
             * Meaningless repetition of JSON.stringify and JSON.parse in Block().decode()
             */
            return new Block().decode(JSON.stringify(encodedBlock));
        });

        return new Blockchain(decodedBlocks);
    }

    async save() { //데이터 베이스에 블록 저장
        const encodedBlockchain = this.encode();
        try { await db.put("Blockchain", encodedBlockchain); }
        catch (err) { throw err; }
    }

    async load() { //블록체인 가져오기
        try {
            const encodedBlockchain = await db.get("Blockchain");
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

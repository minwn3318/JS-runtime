import { SHA256 as _SHA256 } from "crypto-js";
import merkle from "merkle";
import { ec as _ec } from "elliptic";
import { logger } from "./logger";

const ec = new _ec("secp256k1");
const fileName = "crypto.js";

function SHA256(elems) {
    const functionName = "SHA256";
    logger.log({level: 'info', message : 'SHA256', fileN : fileName, functionN:functionName});

    return _SHA256(elems.reduce(function (acc, elem) {
        return acc + elem;
    })).toString().toUpperCase();
}

function calculateMerkleTree(data) {
    const functionName = "calculateMerkleTree";
    logger.log({level: 'info', message : 'calculateMerkleTree', fileN : fileName, functionN:functionName});

    const mer = merkle("sha256").sync(data);
    logger.log({level: 'info', message : JSON.stringify(mer), fileN : fileName, functionN:functionName});
    return mer;
}

function calculateMerkleRoot(data) {
    const functionName = "calculateMerkleRoot";
    logger.log({level: 'info', message : 'calculateMerkleRoot', fileN : fileName, functionN:functionName});

    const merkleTree = calculateMerkleTree(data);

    const merkleRoot = merkleTree.root() || '0'.repeat(64);
    logger.log({level: 'info', message : merkleRoot, fileN : fileName, functionN:functionName});
    return merkleRoot;
}

export default {
    ec,
    SHA256,
    calculateMerkleTree,
    calculateMerkleRoot
};

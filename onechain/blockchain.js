"use strict";
import { deepCopy, getCurrentVersion, getCurrentTimestamp, hexToBinary, deepEqual } from "./modules"; // utils
import { SHA256, calculateMerkleRoot } from "./modules"; // crypto
import { BlockHeader, Block, Blockchain } from "./modules"; // types
import { broadcast, responseLatestMsg } from "./modules"; // network

import { boolean } from "random";

var blockchain; //şíˇĎĂźŔÎ şŻźö ÇŇ´ç

async function initBlockchain() { //şíˇĎĂźŔÎ ĂĘąâČ­
    const loadedBlockchain = await new Blockchain().load(); // şíˇĎĂźŔÎ ˇÎľĺ
    if (loadedBlockchain !== undefined) { //şíˇĎĂźŔÎŔĚ Á¤ŔÇľÇžî ŔÖ´Ů¸é
        blockchain = loadedBlockchain; //şíˇĎĂźŔÎ şŻźöÇŇ´çżĄ ˇÎľĺľČ şíˇĎĂźŔÎ ÇŇ´ç
    }
    else { //şíˇĎĂźŔÎŔĚ Á¤ŔÇľÇžî ŔÖÁö žĘ´Ů¸é
        const newBlockchain = new Blockchain([getGenesisBlock()]); //şíˇĎĂźŔÎżĄź­ ÁŚł×˝Ă˝ş şíˇĎŔ¸ˇÎ şíˇĎĂźŔÎŔť ¸¸Ň
        try { newBlockchain.save(); } catch (err) { throw err; } //(try, catch, throw)
        blockchain = newBlockchain; //ťőˇÎżî şíˇĎĂźŔÎŔť şíˇĎĂźŔÎ şŻźöżĄ ÇŇ´ç
    }
}

function getBlockchain() { return deepCopy(blockchain); } //şíˇĎĂźŔÎŔť ąíŔşşšťçÇĎżŠ ş¸łťąâ
function getLatestBlock() { return deepCopy(blockchain.latestBlock()); } //ĂÖąŮ şíˇĎŔť ąíŔş şšťçÇŘź­ ş¸łťąâ

function generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data) { //šŢŔş ľĽŔĚĹÍ ą×´ëˇÎ şíˇĎ ťýźş
    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce); //şíˇĎÇě´ő ťýźş
    return new Block(header, data); //şíˇĎÇě´őżÍ ľĽŔĚĹÍˇÎ şíˇĎ ťýźş
}

function generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data) { //šŢŔş ľĽŔĚĹÍˇÎ ¸ÓĹŹˇçĆŽ¸Ś ¸¸ľéžî łťžî şíˇĎ ťýźş
    const merkleRoot = calculateMerkleRoot(data); //¸ÓĹŹ ˇçĆŽ ¸¸ľéžî łż
    return generateRawBlock(version, index, previousHash, timestamp, merkleRoot, difficulty, nonce, data); //šŢŔşľĽŔĚĹÍ ą×´ëˇÎ şíˇĎ ťýźş(ŔÚšŮ˝şĹŠ¸łĆŽ ÇÔźöżÍ °´Ăź)
}

function getGenesisBlock() { //ÁŚł×˝Ă˝ş şíˇĎ
    const version = "1.0.0"; //šöŔü
    const index = 0; //ŔÎľŚ˝ş
    const previousHash = '0'.repeat(64); //ÇŘ˝Ă°Ş
    const timestamp = 1231006505; // 01/03/2009 @ 6:15pm (UTC)
    const difficulty = 0; // ŔŰž÷Áő¸í žîˇÁżňÁ¤ľľ žîˇÁżňÁ¤ľľżĄ ľűśó šŽÁŚ°Ą ¸¸ľéžîÁü
    const nonce = 0; // ŔŰž÷Áő¸íżĄ ťçżëľÇ´Â łí˝ş
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"]; //ľĽŔĚĹÍ

    return generateBlock(version, index, previousHash, timestamp, difficulty, nonce, data); //şíˇĎ ťýźş
}

function generateNextBlock(blockData) { //´ŮŔ˝ şíˇĎ ťýźş
    const previousBlock = getLatestBlock(); // ŔĚŔü şíˇĎ ČŽŔÎ

    const currentVersion = getCurrentVersion(); //ÇöŔç şíˇĎŔÇ šöŔü °ĄÁŽżŔąâ
    const nextIndex = previousBlock.header.index + 1; //ŔĚŔü şíˇĎŔÇ Çě´őżĄź­ ŔÎľŚ˝ş °ĄÁŽżÍ 1 ´őÇĎąâ
    const previousHash = previousBlock.hash(); //ŔĚŔü şíˇĎŔÇ ÇŘ˝Ă°Ş °ĄÁŽżŔąâ
    const nextTimestamp = getCurrentTimestamp(); // ÇöŔç Ĺ¸ŔÓ ˝şĹĆÇÁ °ĄÁŽżŔąâ
    const merkleRoot = calculateMerkleRoot(blockData); //ťýźşÇŇ şíˇĎŔÇ ľĽŔĚĹÍżĄź­ ¸ÓĹŹˇçĆŽ ¸¸ľéąâ
    const difficulty = getDifficulty(getBlockchain()); //şíˇĎĂźŔÎżĄź­ žîˇÁżň Á¤ľľ °ĄÁŽżŔąâ
    const validNonce = findNonce(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty); //ŔŰž÷Áő¸íŔ¸ˇÎ łí˝ş ą¸ÇĎąâ

    return generateRawBlock(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot, difficulty, validNonce, blockData); //šŢŔş ľĽŔĚĹÍˇÎ şíˇĎťýźş
}

function addBlock(newBlock) { //şíˇĎ ´őÇĎąâ
    if (isValidNewBlock(newBlock, getLatestBlock())) { //şíˇĎĂźŔÎŔÇ ĂÖąŮ şíˇĎŔ¸ˇÎ ťőˇÎ ¸¸ľéžîÁř şíˇĎ ČŽŔÎÇĎąâ
        blockchain.push(newBlock); //ŔŻČżÇĎ´Ů¸é şíˇĎ ´őÇĎąâ
        try { blockchain.save(); } catch (err) { throw err; } //şíˇĎŔúŔĺ
        return true; //źş°řÇßŔ˝Ŕť žË¸˛
    }
    return false; //˝ÇĆĐ¸Ś žË¸˛
}

function mineBlock(blockData) { //şíˇĎťýźş
    const newBlock = generateNextBlock(blockData); //´ŮŔ˝ şíˇĎťýźşŔ¸ˇÎ şíˇĎ ÇŇ´ç

    if (addBlock(newBlock)) { //şíˇĎ ŔŻČż ČŽŔÎ
        broadcast(responseLatestMsg()); //ŔüĂź ÇÇžîľéżĄ°Ô şíˇĎ ŔüĆÄ
        return newBlock; //ťő şíˇĎ šÝČŻ
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
function findNonce(version, index, previoushash, timestamp, merkleRoot, difficulty) { //łí˝ş ŔŻČż°Ş ĂŁąâ
    var nonce = 0; //łí˝ş´Â 0żĄź­ ˝ĂŔŰ
    while (true) { //ÂüŔĚ łŞżĂ ś§ ąîÁö šÝşš
        var hash = SHA256([version, index, previoushash, timestamp, merkleRoot, difficulty, nonce]); //ÇŘ˝ĂżĄź­ žË¸ÂŔş łë˝ş ĂŁąâ
        if (hashMatchesDifficulty(hash, difficulty)) { return nonce; } //žîˇÁżňżĄ ¸Â´Â łí˝ş¸Ś ĂŁžŇ´Ů¸é łë˝ş šÝČŻ
        nonce++; //ą×ˇ¸Áö žĘ´Ů¸é łí¤¤˝ş żĂ¸Žąâ
    }
}

function hashMatchesDifficulty(hash, difficulty) { //žîˇÁżň ¸¸ľéąâ
    const hashBinary = hexToBinary(hash); //ÇŘ˝Ă¸Ś °ĄÁö°í ÇŘ˝Ă šŮŔĚłĘ¸Ž ¸¸ľéąâ
    const requiredPrefix = '0'.repeat(difficulty); // žîˇÁżň Á¤ľľżĄ ¸Â´Â Á¤´ä ¸ś´Ăąâ
    return hashBinary.startsWith(requiredPrefix); //žîˇÁżň ¸¸ľéąâ
}

const BLOCK_GENERATION_INTERVAL = 10; // in seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // in blocks

function getDifficulty(aBlockchain) { //žîˇÁżň ŔűŔýÇĎ°Ô ¸ÂĂßžî ą¸ÇĎąâ
    const latestBlock = aBlockchain.latestBlock(); //ĂÖąŮ şíˇĎ ą¸ÇĎąâ
    if (latestBlock.header.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.header.index !== 0) { //şíˇĎŔÎľŚ˝ş 10šřÂ°
        return getAdjustedDifficulty(aBlockchain); //şíˇĎŔÇ žîˇÁżňÁ¤ľľ ĆÇÁ¤
    }
    return latestBlock.header.difficulty; //şíˇĎŔÎľŚ˝şŔÇ ¸đľâˇŻ°Ą 0ŔĚ žĆ´Ď¸é ÁöąÝ žîˇÁżňŔ¸ˇÎ ÁöźÓ
}

function getAdjustedDifficulty(aBlockchain) { //şíˇĎŔÇ žîˇÁżň Á¤ľľ ą¸ÇĎąâ
    const latestBlock = aBlockchain.latestBlock(); // ĂÖąŮ şíˇĎ
    const prevAdjustmentBlock = aBlockchain.indexWith(aBlockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL); //şńął şíˇĎ ą¸ÇĎąâ
    const timeTaken = latestBlock.header.timestamp - prevAdjustmentBlock.header.timestamp; //Ĺ¸ŔÓ ĂźĹŠ
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL; //żšťóľÇ´Â Ĺ¸ŔÓ ą¸ÇĎąâ

    if (timeTaken < timeExpected / 2) { //żšťóŔÇ ŔýšÝş¸´Ů ÂŞ´Ů¸é
        return prevAdjustmentBlock.header.difficulty + 1; //žîˇÁżň Áő°Ą
    }
    else if (timeTaken > timeExpected * 2) { //żšťóŔÇ ľÎščş¸´Ů ąć´Ů¸é
        return prevAdjustmentBlock.header.difficulty - 1; //žîˇÁżň °¨źŇ
    }
    else {
        return prevAdjustmentBlock.header.difficulty; //žîˇÁżň Ŕűżë
    }
}

function isValidBlockStructure(block) { //ą¸Áś ŔŻČżÇÔ ĆÇÁ¤
    return typeof (block.header.version) === 'string'
        && typeof (block.header.index) === 'number'
        && typeof (block.header.previousHash) === 'string'
        && typeof (block.header.timestamp) === 'number'
        && typeof (block.header.merkleRoot) === 'string'
        && typeof (block.header.difficulty) === 'number'
        && typeof (block.header.nonce) === 'number'
        && typeof (block.data) === 'object';
}

function isValidTimestamp(newBlock, previousBlock) { //Ĺ¸ŔÓ ŔŻČżÇÔ ĆÇÁ¤ 60ĂĘ ÁöłŞžß şíˇĎťýźş ŔŻČż
    return (previousBlock.header.timestamp - 60 < newBlock.header.timestamp)
        && newBlock.header.timestamp - 60 < getCurrentTimestamp();
}

function isValidNewBlock(newBlock, previousBlock) { //şíˇĎ ŔŻČż
    if (!isValidBlockStructure(newBlock)) { //şíˇĎą¸Áś ŔŻČż
        console.log("Invalid block structure: " + JSON.stringify(newBlock)); //(stringify)
        return false;
    }
    else if (previousBlock.header.index + 1 !== newBlock.header.index) { //şíˇĎ ŔÎľĽ˝ş ŔŻČż ĆÇÁ¤
        console.log("Invalid index");
        return false;
    }
    else if (previousBlock.hash() !== newBlock.header.previousHash) { //ŔĚŔüÇŘ˝Ă°Ş°ú ÁřÂĽ ŔĚŔüÇŘ˝Ă°Ş şńął
        console.log("Invalid previousHash");
        return false;
    }
    else if (calculateMerkleRoot(newBlock.data) !== newBlock.header.merkleRoot) { //¸ÓĹŹˇçĆŽ Áśťç
        console.log("Invalid merkleRoot");
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) { // Ĺ¸ŔÓ˝şĹĆÇÁ Áśťç
        console.log('Invalid timestamp');
        return false;
    }
    else if (!hashMatchesDifficulty(newBlock.hash(), newBlock.header.difficulty)) { //žîˇÁżňŔĚ ¸¸ľéžîÁł´ÂÁö Áśťç
        console.log("Invalid hash: " + newBlock.hash());
        return false;
    }
    return true;
}

function isValidChain(blockchainToValidate) { //şíˇĎĂźŔÎ ŔŻČż Áśťç
    if (!deepEqual(blockchainToValidate.indexWith(0), getGenesisBlock())) { //şíˇĎĂźŔÎ ÁśťçÇĎ´ÂľĽ ÁŚł×˝Ă˝ş ťýźş ÇÔźöżÍ ÁřÂĽ ÁŚł×˝Ă˝ş°Ą ŔŻČżÇĎÁö žĘ´Ů¸é °ĹÁţ šÝČŻ
        return false;
    }
    var tempBlockchain = new Blockchain([blockchainToValidate.indexWith(0)]); //şíˇĎĂźŔÎ ÁŚł×˝Ă˝şˇÎ şńął şíˇĎĂźŔÎ ¸¸ľéąâ
    for (var i = 1; i < blockchainToValidate.length; i++) { //źřÂ÷ŔűŔ¸ˇÎ ÁöąÝ şíˇĎ°ú ŔĚŔü şíˇĎşńął
        if (isValidNewBlock(blockchainToValidate.indexWith(i), tempBlockchain.indexWith(i - 1))) {
            tempBlockchain.push(blockchainToValidate.indexWith(i)); //¸Â´Ů¸é ¸ÂŔş şíˇĎÂ÷ˇĘÂ÷ˇĘ şńąłşíˇĎĂźŔÎ(ŔĚŔü)żĄ łÖąâ
        }
        else { return false; } //¸ÂÁö žĘ´Ů¸é °ĹÁţ šÝČŻ
    }
    return true;
}

function isReplaceNeeded(originalBlockchain, newBlockchain) { //şíˇĎąłĂź ĆÇÁ¤
    /**
     * TODO: the haviest chain rule.
     * The current implementation is the longest chain rule.
     */
    if (originalBlockchain.length < newBlockchain.length) { return true; } //ąâÁ¸şíˇĎŔĚ ťőˇÎżî şíˇĎĂźŔÎş¸´Ů ÂŞ´Ů¸é ąłĂź
    else if (originalBlockchain.length > newBlockchain.length) { return false; } //ą×ˇ¸Áö žĘ´Ů¸é ą×´ëˇÎ
    else { return boolean(); } //°°´Ů¸é ľŃÁß ÇĎłŞ šŤŔŰŔ§ źąĹĂ
}

function replaceChain(newBlockchain) { //şíˇĎąłĂź
    if (isReplaceNeeded(blockchain, newBlockchain) && isValidChain(newBlockchain)) { //şíˇĎąłĂź °Ą´ÉÇŃÁö ĂŁąâ
        console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");

        blockchain = deepCopy(newBlockchain); //şíˇĎÄŤÇÇ
        try { blockchain.save(); } catch (err) { throw err; } //şíˇĎŔúŔĺ

        broadcast(responseLatestMsg()); //´Ů¸Ľ łëľĺżĄ ŔüĆÄ
    }
    else { console.log("Received blockchain invalid"); }
}

export default { //¸đľâŔüĆÄ ąâşť
    initBlockchain,
    getBlockchain,
    getLatestBlock,
    addBlock,
    mineBlock,
    replaceChain
};

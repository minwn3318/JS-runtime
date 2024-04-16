'use strict';
import { logger } from "./logger";
import { cloneDeep } from "lodash";
import { existsSync, mkdirSync, readFileSync } from "fs";

const fileName = "utils.js";

function deepCopy(src) {
    const clone = cloneDeep(src);
    const functionName = "deepCopy";
    logger.log({level: 'info', message : JSON.stringify(clone), fileN : fileName, functionN:functionName});

    return clone;
}

function deepEqual(value, other) {
    // return _.isEqual(value, other); // Can not get rid of functions.

    const bool = (JSON.stringify(value) === JSON.stringify(other));

    const functionName = "deepEqual";
    logger.log({level: 'info', message : bool, fileN : fileName, functionN:functionName});

    return bool;
}

function recursiveMkdir(path) {
    const functionName = "recursiveMkdir";
    logger.log({level: 'info', message : 'recursiveMkdir', fileN : fileName, functionN:functionName});

    var pathSplited = path.split('/');
    logger.log({level: 'info', message : JSON.stringify(pathSplited), fileN : fileName, functionN:functionName});

    var tempPath = '';
    for (var i = 0; i < pathSplited.length; i++) {
        tempPath += (pathSplited[i] + '/');
        logger.log({level: 'info', message : tempPath, fileN : fileName, functionN:functionName});
        
        if (!existsSync(tempPath)) { 
            logger.log({level: 'info', message : 'not existsSync', fileN : fileName, functionN:functionName});
            mkdirSync(tempPath); 
        }
    }
}

function hexToBinary(s) {
    const functionName = "hexToBinary";
    logger.log({level: 'info', message : 'hexToBinary', fileN : fileName, functionN:functionName});

    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011',
        '4': '0100', '5': '0101', '6': '0110', '7': '0111',
        '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
        'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111'
    };

    var ret = "";
    for (var i = 0; i < s.length; i++) {
        if (lookupTable[s[i]]) { ret += lookupTable[s[i]]; }
        else { return null; }
    }
    logger.log({level: 'info', message : ret, fileN : fileName, functionN:functionName});
    return ret;
}

function getCurrentTimestamp() {
    const functionName = "getCurrentTimestamp";
    logger.log({level: 'info', message : 'getCurrentTimestamp', fileN : fileName, functionN:functionName});

    const time = Math.round(new Date().getTime() / 1000);
    logger.log({level: 'info', message : JSON.stringify(time), fileN : fileName, functionN:functionName});

    return time;
}

function getCurrentVersion() {
    const functionName = "getCurrentVersion";
    logger.log({level: 'info', message : 'getCurrentVersion', fileN : fileName, functionN:functionName});

    const packageJson = readFileSync("./package.json");
    logger.log({level: 'info', message : packageJson, fileN : fileName, functionN:functionName});

    const currentVersion = JSON.parse(packageJson).version;
    logger.log({level: 'info', message : JSON.stringify(currentVersion), fileN : fileName, functionN:functionName});


    return currentVersion;
}

export default {
    deepCopy,
    deepEqual,
    recursiveMkdir,
    hexToBinary,
    getCurrentTimestamp,
    getCurrentVersion
};

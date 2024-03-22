'use strict';
import { cloneDeep } from "lodash";
import { existsSync, mkdirSync, readFileSync } from "fs";

function deepCopy(src) {
    console.log("start-----------");
    console.log("[deepcopy]");
    const clone = cloneDeep(src);
    console.log("<copy>");
    console.dir(clone);
    console.log("end----------");
    return clone;
}

function deepEqual(value, other) {
    // return _.isEqual(value, other); // Can not get rid of functions.
    console.log("start-----------");
    console.log("[deepEaual]");
    console.log("<equal>");
    const bool = (JSON.stringify(value) === JSON.stringify(other));
    console.dir(bool);
    console.log("end----------");
    return bool;
}

function recursiveMkdir(path) {
    console.log("start----------");
    console.log("[recursiveMkdir]");
    var pathSplited = path.split('/');
    console.log("<splited >: "+pathSplited);

    var tempPath = '';
    for (var i = 0; i < pathSplited.length; i++) {
        tempPath += (pathSplited[i] + '/');
        console.log("<tem> : " + tempPath);
        
        if (!existsSync(tempPath)) { 
            console.log("<exis> : ");
            mkdirSync(tempPath); 
            console.log("<mkdir> : ");
        }
    }
    console.log("end----------");
}

function hexToBinary(s) {
    console.log("end----------");
    console.log("[hexToBinary]");
    console.log("<hex>");
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
    console.dir(ret);
    console.log("end----------");
    return ret;
}

function getCurrentTimestamp() {
    console.log("start----------");
    console.log("[getcurrenttime]");
    console.log("<time>");
    const time = Math.round(new Date().getTime() / 1000);
    console.log("end----------");
    return time;
}

function getCurrentVersion() {
    console.log("start----------");
    console.log("[getCurrentVersion]");
    const packageJson = readFileSync("./package.json");
    console.log("<packageJson>");
    console.dir(packageJson);

    const currentVersion = JSON.parse(packageJson).version;
    console.log("<currentVersion>");
    console.dir(currentVersion);
    console.log("end----------");

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

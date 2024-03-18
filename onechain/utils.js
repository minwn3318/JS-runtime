'use strict';
import { cloneDeep, split } from "lodash";
import { existsSync, mkdirSync, readFileSync } from "fs";

function deepCopy(src) { //깊은 복사 (cloneDeep)
    return cloneDeep(src);
}

function deepEqual(value, other) { //펀션 구하기
    // return _.isEqual(value, other); // Can not get rid of functions.
    return JSON.stringify(value) === JSON.stringify(other); //제이슨 파일이 같은지 확인하기
}

function recursiveMkdir(path) { //(split)
    var pathSplited = path.split('/'); //파일경로를 슬레시대로 나누기 배열화
    var tempPath = '';
    for (var i = 0; i < pathSplited.length; i++) {
        tempPath += (pathSplited[i] + '/'); //슬레시를 넣기
        if (!existsSync(tempPath)) { mkdirSync(tempPath); } //파일이 존재하지 않다면 
    }
}

function hexToBinary(s) { //헥스 읽기
    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011',
        '4': '0100', '5': '0101', '6': '0110', '7': '0111',
        '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
        'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111'
    };

    var ret = "";
    for (var i = 0; i < s.length; i++) {
        if (lookupTable[s[i]]) { ret += lookupTable[s[i]]; } //헥스데로 전환하여 붙이기
        else { return null; }
    }
    return ret;
}

function getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000); //데이터에서 초단위 시간을 구해 밀리세컨트로 만들기(math.round)
}

function getCurrentVersion() {
    const packageJson = readFileSync("./package.json"); //패키지의 제이슨 파일 읽기
    const currentVersion = JSON.parse(packageJson).version; //제이슨 문자열을 자바스크립트 객체로 전환
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

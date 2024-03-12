//chapter-1
"use strict"; //엄격모드 사용 - 약간의 오류나 예상되는 오류를 잡아준다
const fs = require("fs"); //디렉토리의 외부 모듈을 사용하겠다라는 의미 commonjs모드에 있음
const merkle = require("merkle"); // 3줄과 같음
const CryptoJS = require("crypto-js"); //3줄과 같음

class BlockHeader{ //블록헤더 클래스
    constructor(version, index, previousHash, timestamp, merkleRoot){ //생성자
        this.version = version; //클래스 내부에서 사용할 속성 따로 명시하진 않고 this로 명시한다 블록체인의 자체 버전 
        this.index = index; // 블록의 길이(인덱스)
        this.previousHash = previousHash; //이전블록의 해시값(블록의 무결성 검증)
        this.timestamp = timestamp; //타임스탬프(시간)
        this.merkleRoot = merkleRoot; // 머클루트(데이터의 무결성 검증)
    }
    //블록헤더의 정보를 짠 자료구조 클래스이다 
}

class Block{//블록 클래스
    constructor(header, data){ // 생성자
        this.header = header; // 클래스 내부 속성. 헤더(블록체인 헤더부분)
        this.data = data; // 클래스 내부 속성 데이터필드
    }
}

var blockchain = [getGenesisBlock()]; //블록체인, 배열로 선언, 배열 값 첫번째는 제네시스 블록이 있다.

function getBlockchain() { return blockchain; } //블록체인을 반환하는 함수
function getLastestBlock() {return blockchain[blockchain.length - 1];} //블록체인의 마지막 블록을 반환하는 함수, 인덱스로 연산하여 반환한다   

function getGenesisBlock(){ //제네시스 블록 생성 함수
    const version = "1.0.0"; //버전
    const index = 0; //인덱스
    const previousHash = '0'.repeat(64); //이전 해시값. 초기 값이니 전부 0으로 만든다. sha256이 64개 문자열을 반환하니까
    const timestamp = 1231006505; //시간
    const data = ["The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"]; //데이터

    const merkleTree = merkle("sha256").sync(data); //"sha256" 타입으로 머클트리를 만들고 데이터가 업데이트 되면 바로 반영하기로 한다 데이터는 블록의 멤버변수 중 하나다
    const merkleRoot = merkleTree.root() || '0'.repeat(64); //머클루트 머클트리에서 루트를 만들어 낸다. 만약 데이터가 비어있어서 루트를 만들 수 없다면 0으로 한다

    const header = new BlockHeader(version, index, previousHash, timestamp, merkleRoot); //블록헤더 클래스 객체를 선언한다
    return new Block(header, data); //블록헤더와 데이터로 블록 클래스 객체르 선언한다 그리고 함수의 값을 반환한다
}

function genrateNextBlock(blockData){ //다음 블록을 생성한다
    const previousBlock = getLastestBlock(); // 블록체인 마지막 블록 가져오는 함수를 이용해 마지막 블록을 함수 블럭의 변수에 저장. 블럭에서 추출할 멤버변수를 위해 저장한것
    const currentVersion = getCurrentVersion(); // 현재 블록체인의 버전을 가져오는 함수를 이용해 버전 변수에 저장
    const nextIndex = previousBlock.header.index + 1; //마지막 블록의 인덱스에 1을 더한 인덱스 값을 변수에 저장
    const previousHash = calculateHashForBlock(previousBlock); //마지막 블록을 매개변수로 해서 해시값을 계산하여 해시값 멤버변수에 저장   
    const nextTimestamp = getCurrentTimestamp(); //현재 시간을 반환하는 함수를 이용해 타임스탬프 멤버변수에 저장   

    const merkleTree = merkle("sha256").sync(blockData);  //"sha256" 타입으로 머클트리를 만들고 데이터가 업데이트 되면 바로 반영하기로 한다 데이터는 블록의 멤버변수 중 하나다
    const merkleRoot = merkleTree.root() || '0'.repeat(64); //머클루트 머클트리에서 루트를 만들어 낸다. 만약 데이터가 비어있어서 루트를 만들 수 없다면 0으로 한다
    const newBlockHeader = new BlockHeader(currentVersion, nextIndex, previousHash, nextTimestamp, merkleRoot); //블록헤더 클래스 객체를 선언한다

    return new Block(newBlockHeader, blockData); //블록헤더와 데이터로 블록 클래스 객체르 선언한다 그리고 함수의 값을 반환한다
}

function getCurrentVersion(){ //현재 버전 구하는 함수
    const packageJson = fs.readFileSync("./package.json"); //메타데이터가 정리된 패키지 제이슨파일에서 파일시스템 클래스의 함수인 파일읽기 함수로 제이슨 파일 읽고 저장
    const currentVersion = JSON.parse(packageJson).version; //제이슨 모듈에서 제이슨파일 매개변수에서 버전이라는 이름을 가진 것을 파싱함(버전이라 되어 있는 것을 찾고 그에 맞게 해석하고 읽어옴)
    return currentVersion; //버전 반환
}

function getCurrentTimestamp(){ //현재 타임 구하기
    return Math.round(new Date().getTime() / 1000); //숫자 모듈에서 반올립 함수를 이용한다. 값은 데이터 클래스 객체를 사용하고 클래스 객체의 시간을 구하는 함수로 시간을 얻고 시간이 밀리초이기에 1초로 만들어야해서 1000으로 나눈다
}

function calculateHash(version, index, previousHash, timestamp, merkleRoot){ //해시 계산 함수
    return CryptoJS.SHA256(version + index + previousHash + timestamp + merkleRoot).toString().
    toUpperCase(); //암호와 알고리즘 라이브러리에서 sha56해시 알고리즘을 통해 해시값을 만든다. 해시값을 문자열로 만들고, 문자열의 알파벳을 다 대문자로 만들어준다
}

function calculateHashForBlock(block){ //블록에서 값을 찾아 그 값으로 해시 계산하기
    return calculateHash( //블록 헤더의 버전, 인덱스, 해시, 타임스탬프, 머클루트를 매개변수로 받는다
        block.header.version,
        block.header.index,
        block.header.previousHash,
        block.header.timestamp,
        block.header.merkleRoot
    );
}

function isValidNewBlock(newBlock, previousBlock){ //생성된 블록이 유효한지 확인하는 함수
    if(!isValidBlockStructure(newBlock)){ //블록 구조가 유효하지 않다면 펄스 반환
        console.log('invalid block structure : %s', JSON.stringify(newBlock));
        return false;
    }
    else if(previousBlock.header.index + 1 != newBlock.header.index){  //생성된 블록의 인데긋가 이전 블록 인덱스에서 1 더한 값이 아닌 경우 펄스 반환
        console.log("invalid index");
        return false;
    }
    else if (calculateHashForBlock(previousBlock) != newBlock.header.previousHash){ //이전 블록에서 계산한 해시값과 생성된 블록의 이전해시값이 같지 않은 경우 펄스 반환
        console.log("Invalied previous Hash")
        return false;
    }
    else if(
        (newBlock.data.length != 0 && (merkle("sha256").sync(newBlock.data).root() != newBlock.header.merkleRoot)) //생성된 블록 데이터의 머클루트와 헤더 머클루트가 다른경우
        || (newBlock.data.length == 0 && ('0'.repeat(64) !=  newBlock.header.merkleRoot)) // 펄스 반환, 앞의 생성된 데이터의 길이를 조사하는 이유는 데이터가 없다면 머클루트가 0이기에 이것을 판별하기 위해 넣어줌
    ){
        console.log('Invalid merkleRoot');
        return false;
    }
    return true;
}

function isValidBlockStructure(block){ //블록구조가 유효한지 조사하는 함수 블록헤더에 있는 데이터들의 타입을 확인한다
    return typeof(block.header.version) === 'string' //엄격한 일치 비교연산자로 형변환을 전혀 고려하지 않는다. 
        && typeof(block.header.index) === 'number'
        && typeof(block.header.previousHash) === 'string'
        && typeof(block.header.timestamp) === 'number'
        && typeof(block.header.merkleRoot) === 'string'
        && typeof(block.data) === 'object';
}

function isValidChain(blockchainToValidate){ //체인이 유효한지 확인하는 함수 생성블록 유효 함수를 반복하는 것이다
    if (JSON.stringify(blockchainToValidate[0]) != JSON.stringify(getGenesisBlock())){ //블록의 데이터를 제이슨 형태의 문자열 데이터로 표시한다 최초의 제네시스 블록과 같은지 확인하여 체인이 유효한지 확인한다
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]]; //블록체인의 첫번째 값을 저장한다 배열에
    for (var i = 1; i < blockchainToValidate.length; i++){ //반복문을 이용하여 i를 1로 초기화 하고 블록체인 인덱스까지 반복하고 블럭이 끝날때 마다 i를 1올린다 
        if(isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])){ //각 블럭들이 유효하다면 (블록유효 함수)
            tempBlocks.push(blockchainToValidate[i]); //선언한 배열에 뒤에서 부터 넣어준다. 해당 함수를 쓸때마다 덮어 써진다
        }
        else { return false};
    }
    return true;
}

function addBlock(newBlock) { // 블록을 더한다
    if(isValidNewBlock(newBlock, getLastestBlock())){ //블록 유효함수를 통해  생성된 블록이 마지막 블록과 비교하여 유효한지 검증하고
        blockchain.push(newBlock); //검증이 완료되면 블록체인에 추가한다
        return true;
    }
    return false;
}

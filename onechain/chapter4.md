### 타원곡선 암호 모듈 호출 및 객체 생성
```
const ecdsa = require("elliptic"); //타원곡선 암호 모듈을 해당 스크립트에서 사용하겠다라는 의미
const ec = new ecdsa.ec("secp256k1"); //타원곡선 암호 모듈에서 타원곡선 암호 객체를 생성한다(생성점은 공통된 점으로 사용된다) 
```
### 지갑 및 비밀키 저장 디렉토리 경로 생성
```
const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || "default"); //비밀키 디렉터리가 있을 지갑 장소다. 월렛이라는 디렉터리의 디폴트 경로 문구를 만든다
const privateKeyFile = privateKeyLocation + "/private_key"; // 비밀키를 저장하는 디렉터리이다 지갑 장소에 비밀키 경로 문구를 만든다
```
### 지갑 초기화 및 생성
```
function initWallet() {// 지갑 생성 함수
    if (fs.existsSync(privateKeyFile)) { //해당 경로가 존재하는 지 찾는 파일모듈의 함수  -> 존재한다면 참 값을 반환한다
        console.log("Load wallet with private key from: %s", privateKeyFile);
        return;
    }

    if (!fs.existsSync("wallet/")) { fs.mkdirSync("wallet/"); } //경로에서 wallet 경로가 없다면 해당 이름을 가진 디렉토리를 만든다
    if (!fs.existsSync(privateKeyLocation)) { fs.mkdirSync(privateKeyLocation); } //만약 경로자체가 없다면 지갑디렉토리를 만든다

    const newPrivateKey = generatePrivateKey();// 16진수로 만든 비밀키를 생성하고 변수에 저장한다
    fs.writeFileSync(privateKeyFile, newPrivateKey); //비밀키 디렉토리에 비밀키 파일을 생성한다(폴더를 수정한다)
    console.log("Create new wallet with private key to: %s", privateKeyFile);
}
```
### 비밀키 생성하기
```
function generatePrivateKey() { //비밀키 생성 함수
    const keyPair = ec.genKeyPair(); //타원곡선암호 객체에서 키쌍 객체를 생성을 한다 키 쌍에서 하나는 타원곡선점의 스칼라곱 정수이고 하나는 그 연산 값인 점이다
    const privateKey = keyPair.getPrivate(); //키 쌍에서 비밀키를 변수 객체에 저장한다 비밀키는 2진수 한 자리수를 256번 반복해서 나온 값들을 이어 붙여 2진수인 큰 수를 만들어낸다
    return privateKey.toString(16); //비밀키를 16진수로 전환하여 함수의 반환값으로 낸다
}
```
### 비밀키를 통해 공개키 생성
```
function getPublicFromWallet() { //공개키 생성 함수
    const privateKey = getPrivateFromWallet(); //비밀키를 가져온다
    const key = ec.keyFromPrivate(privateKey, "hex"); //주어진 비밀키로부터 키쌍을 만들어낸다. 이때 16진수로 만들어낸다(비밀키 생성시 키쌍 생성과 다르게 컴퓨터가 비밀키를 무작위롤 정하는게 아닌 사용자가 정의한 비밀키로 키쌍을 생성한다)
    return key.getPublic().encode("hex"); // 공개키를 직렬화하여 반환한다
}
```
### 지갑에서 비밀키 부러오기
```
function getPrivateFromWallet() {// 비밀키 불러오기
    const buffer = fs.readFileSync(privateKeyFile, "utf8"); //파일을 읽어 변수객체에 저장한다 읽는 타입은 유니코드 인코딩으로 읽는다
    return buffer.toString(); //16진수의 유니코드로 읽어온 파일을 문자열로 바꾸어 반환한다
}
```

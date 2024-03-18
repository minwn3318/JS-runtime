const fs = require('fs');

const filePath = 'path/to/textfile.txt'; // 텍스트 파일 경로
const newText = '안녕'; // 새로운 텍스트 내용


// 텍스트 파일 읽기
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('파일 읽기 오류:', err);
        return;
    }

    // 읽은 텍스트 데이터 출력
    console.log('텍스트 파일 내용:');
    console.log(data);
});

// 텍스트 파일 쓰기
fs.writeFile(filePath, newText, 'utf8', (err) => {
    if (err) {
        console.error('파일 쓰기 오류:', err);
        return;
    }
    console.log('텍스트 파일 내용을 성공적으로 수정했습니다.');
});

// 이미지 파일 경로
const imagePath = 'path/to/image.jpg';

// 이미지 파일 읽기
fs.readFile(imagePath, (err, data) => {
    if (err) {
        console.error('파일 읽기 오류:', err);
        return;
    }

    // 읽은 이미지 데이터를 이용한 작업 수행
    console.log('이미지 파일을 성공적으로 읽었습니다.');
    // 여기에서 읽은 데이터(data)를 원하는 대로 처리할 수 있습니다.
});

const { createCanvas, loadImage } = require('canvas');

// 이미지 파일 읽기
loadImage(imagePath).then(image => {
    // Canvas 생성
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 이미지를 Canvas에 그리기 (원본 그대로)
    ctx.drawImage(image, 0, 0);

    // 이미지 좌우 반전
    ctx.translate(canvas.width, 0); // 좌우 반전을 위해 캔버스를 오른쪽으로 이동
    ctx.scale(-1, 1); // x 축을 -1로 스케일링하여 좌우 반전
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    // 변환된 이미지 데이터를 파일로 저장
    const out = fs.createWriteStream('path/to/flipped_image.jpg');
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('이미지를 성공적으로 반전시켰습니다.'));
}).catch(err => {
    console.error('파일 읽기 오류:', err);
});

// 흑백 이미지 파일 읽기
loadImage(imagePath).then(image => {
    // Canvas 생성
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 이미지를 Canvas에 그리기 (원본 그대로)
    ctx.drawImage(image, 0, 0);

    // 이미지 픽셀 데이터 가져오기
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 픽셀 값 반전
    for (let i = 0; i < data.length; i += 4) {
        // 흑백 이미지이므로 RGB 값이 동일하므로 한 색상 값만 사용합니다.
        // 밝기 값 = (R + G + B) / 3
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const invertedBrightness = 255 - brightness;

        // 반전된 밝기 값을 RGB에 적용합니다.
        data[i] = invertedBrightness; // Red
        data[i + 1] = invertedBrightness; // Green
        data[i + 2] = invertedBrightness; // Blue
    }

    // 반전된 이미지 데이터를 Canvas에 다시 그립니다.
    ctx.putImageData(imageData, 0, 0);

    // 변환된 이미지 데이터를 파일로 저장
    const out = fs.createWriteStream('path/to/inverted_grayscale_image.jpg');
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('흑백 이미지를 성공적으로 반전시켰습니다.'));
}).catch(err => {
    console.error('파일 읽기 오류:', err);
});


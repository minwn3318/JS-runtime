import winston from "winston"; //로깅 모듈러
import winstonDaily from "winston-daily-rotate-file"; // 로깅 모듈러 플러그인 - 로그파일 관리 플러그인 
import process from "process"; //프로세스관련 기능을 불러오는 모듈

// 윈스톤의 포맷으로 winston의 로깅 메스드인 combine, timestamp, printf를 추출한다
const { combine, timestamp, printf } = winston.format;   

// 해당 노드제이스가 실행되는 디렉터리 이름을 가져오고 하위 폴더로 logs를 가지는 경로 이름을 지정한다
const logDir = `${process.cwd()}/logs`;

// printf로 로깅을 어떻게 찍을 지 커스텀하고 변수에 저장한다.
const logFormat = printf(({ timestamp, fileN, functionN, message }) => {
   return `<${timestamp}> [${fileN}] ${functionN} : ${message}`; 
});

// 로깅할 인스턴스를 만드는 함수를 logger객체 변수에 저장한다
// 레벨단계는 단순히 정보를 알리는 단계인 info로 하고
// 포맷은 타임스탬프와 위에 정한 prinft의 포맷내용을 합친다
// 이 때의 combine함수는 여러 포맷을 합쳐 하나의 포맷으로 만드는 역할을 한다
// timestamp는 로그을 찍는 시간을 체크하는 함수로 형태는 포맷으로 정의한다
// 위에 정의한 logFormat보다 먼저 timestamp를 찍어 logformat에 있는 timestamp를 정의한다  
const logger = winston.createLogger({
          level: 'info',
          format: combine(
             timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
             logFormat, 
          ),
          transports: [ // 로그 파일의 저장 혹은 로깅 방법을 정의한다
                        // 레벨, 날짜, 이름, 파일명, 디렉터리 위치, 최대보관개수, 일정크기도달시 압축유무
                        // 를 정한 winstonDaily 객체를 생성해 파일 저장 및 관리 방법을 정의한다
                    new winstonDaily({
                       level: 'info', 
                       datePattern: 'YYYY-MM-DD', 
                       dirname: logDir, 
                       filename: `%DATE%.log`, 
                       maxFiles: 30, 
                       zippedArchive: true, 
                    }),
              
          ]
       });

// 만약 환경변수가 프로덕션, 실제서버에 배포한 상황이 아니라면 Logger객체에 콘솔을 추가하여 콘솔에서도 로그가 찍히도록한다
// 콘솔에서는 레벨에 따라 색을 입히는 포맷과 심플하게 출력되도록 하는 포맷을 사용한다 
if (process.env.NODE_ENV !== 'production') {
          logger.add(
             new winston.transports.Console({
                format: winston.format.combine(
                   winston.format.colorize(), 
                   winston.format.simple(), 
                ),
             }),
          );
       }
       
export default { 
          logger
};
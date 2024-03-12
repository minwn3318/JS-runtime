# 0대 목표 : 행복한 사람    
# 최대 목표 : 모든 디지털과 오프라인 연결하는 인프라 플랫폼 개발자
# 차대 목표 : 블록체인 전문 웹 백엔드 프로그래머    

## curl이란?   
: curl은 client url 약자로 직역하면 클라이언트의 인터넷주소인데, 클라이언트 입장(서비스 요청자)에서 서버(서비스 제공자)에게 서비스를 요청하는, 즉 명령어 툴이다.   
+ 보통 셸 환경(커맨드라인 환경)에서 REST API 테스트하고 싶을 때 사용한다
  > **셸** : 컴퓨터에서 커널과 응용 서비스 사이에 있어 응용 서비스에서 요청한 내용을 커널로 전달하는 인터페이스. 주로    
  > **커널** : 운영체제의 기능중 하나로 응용 서비스에서 요청한 자원을 안전하고 명확하게 하드웨어로 전달하기 위한 서비스
  > **운영체제** : 컴퓨터의 응용소프트웨어가 올바르게 하드웨어를 사용할 수 있도록 하는 프로그램 
+ 응용계층 프로토콜에 맞추어 서비스를 요청할 수 있다.
**URL** : 인터넷 주소로 컴퓨터 네트워크 상의 컴퓨터 자원의 위치를 말한다   

### CURL 명령어 문서   
curl 명령어 문서 사이트 / 정리 사이트   
- https://curl.se/docs/manpage.html
- https://inpa.tistory.com/entry/LINUX-%F0%9F%93%9A-CURL-%EB%AA%85%EB%A0%B9%EC%96%B4-%EC%82%AC%EC%9A%A9%EB%B2%95-%EB%8B%A4%EC%96%91%ED%95%9C-%EC%98%88%EC%A0%9C%EB%A1%9C-%EC%A0%95%EB%A6%AC#curl_%EB%AA%85%EB%A0%B9%EC%96%B4_%EC%98%B5%EC%85%98

## node.js CLI 명령어 문서   
npm 명령 문서 / 정리 사이트     
- https://docs.npmjs.com/cli/v10/commands
- https://velog.io/@archivvonjang/npm-%EB%AA%85%EB%A0%B9%EC%96%B4-%EC%A0%95%EB%A6%AC   
```
  추가적으로 관련된 옵션을 통해 dependency에 어떻게 저장할 것인지 알아봅시다.
(1) -P or --save-prod : package.json의 dependencies에 패키지를 등록합니다.(default)
(2) -D or --save-dev : package.json의 devDepndencies에 패키지를 등록합니다.
(3) -O or --save-optional : package.json의 optionalDependencies에 패키지를 등록합니다.
(4) --no-save : dependencies에 패키지를 등록하지 않습니다.
출처: https://xtring-dev.tistory.com/11 [xtring.dev:티스토리]
```
## Windows cmd 명령어    
+ cd : 현재 작업 디렉터리 위치 변경
  + cd/ : 상위 디렉터리로 이동
+ mkdir : 디렉터리 생성

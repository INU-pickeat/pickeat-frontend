# 🍽️ pickeat: 고민 없는 맛집 선택 서비스

현재 위치와 음식 종류, 동행 유형, 가격대를 바탕으로 식당을 추천받고 선택한 식당을 기록하는 모바일 중심 웹 서비스입니다. (추후 네이티브 앱 개발 예정)

## 주요 기능

- **회원 관리**: 이메일 인증 회원가입, 로그인, 토큰 갱신, 로그아웃, 비밀번호 재설정
- **내 정보**: 닉네임·자기소개 수정, 프로필 사진 업로드
- **맛집 추천**: 위치·음식·동행·가격 조건 선택, 추천 결과와 거리 표시, 제외 사유에 따른 재추천
- **식당 상세**: 사진 슬라이드와 전체 보기, 위치·영업시간·전화번호, 공개 기록 한줄평
- **Pick 관리**: 식당 선택, 최근 Pick 조회, 스와이프를 통한 식당별 미작성 Pick 취소
- **나의 기록**: 캘린더·지도·기간별 목록 조회, 사진을 포함한 기록 작성·수정·삭제, 공개 여부 설정
- **피드·알림**: 공개 기록 조회, 좋아요·취소, 내 기록에 대한 좋아요 알림
- **탐색·공유**: 지역별 인기 맛집, 식당 상세 링크 공유, 네이버·카카오 지도 링크

## 기술 스택

| 구분                      | 사용 기술                                            |
| ------------------------- | ---------------------------------------------------- |
| UI                        | React 19, JavaScript                                 |
| 개발·빌드                 | Vite 8                                               |
| 스타일                    | Tailwind CSS 4, Pretendard                           |
| 라우팅                    | React Router 7                                       |
| API 통신                  | Axios                                                |
| 애니메이션·제스처         | Framer Motion                                        |
| 지도                      | Google Maps JavaScript API, `@react-google-maps/api` |
| 코드 검사·브라우저 테스트 | ESLint, Playwright                                   |

## 로컬 실행

Node.js `20.19.x` 이상인 20.x 버전 또는 `22.12.0` 이상과 npm이 필요합니다.

### 1. 의존성 설치

```bash
npm ci
```

### 2. 환경변수 설정

프로젝트 최상위에 `.env` 파일을 생성합니다.

```dotenv
VITE_API_BASE_URL=https://api.pickeat.kr/api
VITE_GOOGLE_MAP_API_KEY=your_google_maps_api_key
```

| 변수                      | 용도                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`       | 백엔드 API 기본 주소. `/api`까지 포함하며, 각 API 함수에서 `/v1/...` 경로를 사용합니다. |
| `VITE_GOOGLE_MAP_API_KEY` | 지도 표시와 장소 검색에 사용하는 Google Maps 키                                         |

실제 환경변수 파일은 Git 추적 대상에서 제외합니다. `VITE_`로 시작하는 값은 클라이언트 빌드에 포함되므로 서버 전용 비밀키를 넣지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

## 빌드 및 검사

```bash
# 코드 검사
npm run lint

# 프로덕션 빌드: dist/ 생성
npm run build

# 빌드 결과 로컬 확인
npm run preview
```

## 브라우저 테스트

처음 실행할 때 Chromium을 설치합니다.

```bash
npx playwright install chromium

# 전체 테스트
npx playwright test

# 브라우저 창을 띄워 실행
npx playwright test --headed

# UI 모드
npx playwright test --ui

# 특정 기능만 실행
npx playwright test tests/e2e/recent-delete.spec.js
```

테스트 실행 시 개발 서버를 자동으로 시작하며, `5173` 포트의 서버가 이미 실행 중이면 재사용합니다. 주요 화면은 360·390·430px에서 확인하고, API 흐름은 고정 응답으로 재현합니다. 실제 서버에서의 업로드·데이터 변경 검증은 별도로 필요합니다.

실패 시 스크린샷과 실행 추적을 `test-results/`에 저장합니다. 테스트 결과물과 인증 상태 파일은 Git 추적 대상에서 제외합니다.

## 폴더 구조

```text
src/
  api/             API 요청, 인증 토큰 관리, 이미지 업로드
  assets/          이미지·로고·배경
    icons/         아이콘
  components/
    account/       계정 관련 컴포넌트
    common/        버튼, 화면 전환, 스플래시
    layout/        하단 네비게이션, 탭 메뉴
    pick/          Pick 카드, 스와이프, 삭제 확인
    restaurant/    식당 상세, 사진, 길안내
    review/        기록 수정, 피드 카드, 기록 모달
  config/          Google Maps 설정
  constants/       음식·동행 유형 표시값
  data/            지역별 탐색 화면 데이터
  hooks/           화면별 데이터 조회와 상태 관리
  pages/           라우트별 화면
  utils/           날짜·거리·이미지 URL·입력 검증 등
  App.jsx          라우팅 및 앱 레이아웃
  index.css        공통 스타일
tests/
  e2e/             기능별 Playwright 테스트
```

인증 토큰은 `sessionStorage`에 저장하고 Axios 클라이언트에서 인증 헤더와 토큰 갱신을 처리합니다. 이미지 업로드는 발급받은 URL에 파일을 `PUT`으로 전송한 뒤, 이미지 URL을 작성·수정 API에 전달합니다.

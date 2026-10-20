# 상비예비군 대체 분석 (sangbi-reserve-web)

동원사단 보병대대 현역 결원을 상비예비군(30·60·90·180일형)으로 대체할 때의 임무수행 능력, 비용, 필요 인원, 최적 조합을 분석하는 정적 웹사이트.

## 핵심 결과 (기본 가정)
| 유형 | 현역 1명 대체 인원 | 현역 1명분 비용 | 현역 대비 |
|---|---|---|---|
| 180일형 | 1.46명 | 4,404만원 | 55% |
| 90일형 | 3.16명 | 4,991만원 | 62% |
| 60일형 | 5.08명 | 5,610만원 | 70% |
| 30일형 | 12.25명 | 6,765만원 | 85% |

## 폴더 구조
```
sangbi-reserve-web/
├─ CLAUDE.md              # Claude Code 작업 지침 (여기서 시작)
├─ README.md
├─ package.json / tsconfig.json
├─ docs/
│  ├─ PRD.md              # 제품 요구사항
│  ├─ METHODOLOGY.md      # 계산 기준과 방식 (모델 명세 + 기대값)
│  ├─ SOURCES.md          # 출처·팩트체크 대장, 공식 대조 TODO
│  └─ DEPLOYMENT.md       # 배포 가이드
├─ data/
│  ├─ parameters.json     # 모든 입력 수치 + 검증 수준 + 출처 id
│  └─ sources.json        # 출처 14건
├─ index.html             # 사이트 본문 (Vite 진입점). 숫자는 data-v="키"로 모델 값과 연결
├─ vite.config.ts         # base './' (하위 경로·내부망 정적 서버 공용)
├─ public/favicon.svg
├─ src/
│  ├─ model.ts            # 계산 모델 (순수 함수)
│  ├─ derived.ts          # 본문 문장·예시 계산 숫자 (모델 결과로 생성)
│  ├─ format.ts           # 숫자 표기
│  ├─ main.ts             # 진입점
│  ├─ styles.css          # 프로토타입 스타일 + 툴팁·인쇄 CSS
│  ├─ ui/                 # 출처 목록, 표, 차트(비용·민감도), 계산기(URL 공유)
│  ├─ model.test.ts       # 모델 기대값 테스트 12개
│  └─ site.test.ts        # 각주-출처 id, 외부 링크, 본문 숫자=모델 결과
└─ prototype/
   └─ index.html          # 원본 프로토타입 (참고용)
```

## 시작
```
npm install
npm test
```
그 다음 Claude Code에서: "CLAUDE.md를 읽고 프로토타입을 Vite 사이트로 이식해 줘".

## 유의
공개 자료만 사용했으며, 효율 계수·수당률 등 일부 값은 추정이다. 근거와 검증 수준은 `docs/SOURCES.md`, `docs/METHODOLOGY.md` 참조.

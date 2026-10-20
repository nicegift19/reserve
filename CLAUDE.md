# CLAUDE.md — 상비예비군 전투력 비용분석 웹사이트

Claude Code가 이 저장소에서 작업할 때 따르는 지침.

## 목표
`prototype/index.html`(완성된 단일 HTML 프로토타입)을 **Vite + TypeScript 정적 사이트**로 이식해 웹 배포한다. 요구사항은 `docs/PRD.md`, 계산 명세는 `docs/METHODOLOGY.md`, 출처는 `docs/SOURCES.md`.

## 단일 진실 원천 (Single Source of Truth)
| 무엇 | 어디 | 비고 |
|---|---|---|
| 계산 로직 | `src/model.ts` | 테스트 완료(12개). 프로토타입 인라인 JS와 동일 로직 |
| 입력 수치 | `data/parameters.json` | 하드코딩 금지 |
| 출처 | `data/sources.json` | 각주·출처 목록 렌더링 |
| 문구·레이아웃 | `prototype/index.html` | 디자인 토큰은 `<style>` 상단 `:root` |

## 작업 순서 (권장)
1. `npm install && npm test` — 모델 테스트 12개 통과 확인.
2. `index.html` + `src/main.ts` + `src/styles.css` 구성:
   - 프로토타입의 `<style>` → `src/styles.css`
   - 프로토타입 인라인 `<script>`의 UI 코드 → `src/ui/*.ts`로 분리, 계산은 반드시 `src/model.ts` 호출
   - 프로토타입 인라인 `SOURCES` 배열 → `data/sources.json` import로 교체
3. METHODOLOGY의 예시 계산 숫자를 모델 결과로 렌더링 (PRD F2.4).
4. 각주 무결성 테스트 추가: 빌드 HTML의 모든 `href="#src-n"`이 sources id에 존재 (PRD F1.4).
5. PRD 권장 기능: URL 쿼리 공유(F3), 각주 툴팁(F1.5), 민감도 차트(F4), 인쇄 CSS(F5).
6. 폰트 셀프 호스팅 옵션(`public/fonts/`) — 군 내부망 배포 대비.
7. `docs/DEPLOYMENT.md`대로 배포 설정.

## 규칙
- 사실 문장에는 `[n]` 각주 필수. 각주 없는 사실을 새로 쓰지 말 것.
- 추정값은 `가정` 배지 + METHODOLOGY 링크.
- 수치를 바꾸면: `data/parameters.json` → `docs/METHODOLOGY.md` 부록 → `src/model.test.ts` 기대값 → 본문 결론 문장 순으로 함께 갱신.
- 외부 스크립트·트래커 추가 금지(CSP `default-src 'self'` 유지).
- 외부 링크는 `target="_blank" rel="noopener"`.
- 한국어 문체: 짧고 직접적인 평서문, 보고서 톤.

## 명령
```
npm run dev        # 개발 서버
npm test           # 모델·데이터 테스트
npm run build      # 타입체크 + 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
```

## 미결 사항
`docs/PRD.md` §10 참고 (배포처, 도메인, 2차 출처 공식 대조, P·C 실측값).

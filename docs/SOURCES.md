# 출처 및 팩트체크 대장

- 원본 데이터: `data/sources.json` (사이트는 이 파일로 렌더링)
- 확인일: 2026-10-20
- 검증 수준: **공식·학술** / **2차 출처** (공식 대조 권장) / **가정** (METHODOLOGY 참조)

## 1. 출처 목록

| id | 출처 | 수준 | 이 사이트가 인용한 내용 | 사용 위치 |
|---|---|---|---|---|
| 1 | [국방부 예비군 홈페이지 — 상비예비군 제도](https://www.yebigun1.mil.kr/dmobis/rfh/rgt/info/03_06_prtmsvc.jsp) | 공식 | 단기 30일 이내·평일10/휴일15만, 장기 180일 이내(40~180 선택)·15만, 대상·임무 | 현황표, 단계 4 |
| 2 | [브런치 — 2026 단기 상비예비군 수시모집 공고 정리](https://brunch.co.kr/@respectsoldier/564) | 2차 | 연 15일 구성, 경험자 우선 선발, 240명 | 현황표, 단계 5 |
| 3 | [다음 뉴스 — 집중편성부대 24→30개 (2025.2.11)](https://v.daum.net/v/20250211180312001) | 언론 | 24→30개, 70·100·140·180일 선택 | 현황 |
| 4 | [뉴스1 — 정원 상한 폐지 (2026.9.25)](https://www.news1.kr/diplomacy/defense-diplomacy/6300818) | 언론 | 5,000·700명 상한 폐지, 매년 협의 | 현황 |
| 5 | [정책브리핑 — 2026 달라지는 국방·병무제도](https://www.korea.kr/news/policyNewsView.do?newsId=148957373) | 공식 | 급식비 9,000원, 2030년 훈련비 인상 | 단계 4, 한계 |
| 6 | [studygov — 부사관 봉급표 2026](https://gongmuwon.studygov.kr/wiki/nco-pay/) | 2차 | 중사10 2,911,700 / 상사10 3,453,500 | 단계 1 |
| 7 | [studygov — 장교 봉급표 2026](https://gongmuwon.studygov.kr/wiki/officer-pay/) | 2차 | 대위8 3,763,800 | 단계 1 |
| 8 | [인사혁신처 — 2026년 공무원봉급표](https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/) | 공식 | 봉급표 공식 대조용 | 단계 1 |
| 9 | [이정희(2024) 한성대 박사논문](https://dspace.hansung.ac.kr/bitstream/2024.oak/7425/2/200000848784.pdf) | 학술 | 간부 편성률 10% 미만, 상비 35%/예비 65%, 5,000/700명, 보상비 중요도 | 현황, 결론 3 |
| 10 | [나무위키 — 상비예비군](https://namu.wiki/w/%EC%98%88%EB%B9%84%EA%B5%B0/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/%EC%83%81%EB%B9%84%EC%98%88%EB%B9%84%EA%B5%B0) | 2차(참고) | 명칭 변경(2025), 60사단 장기형 4명(2024), 교통비, 2030 인상 | 현황, 결론 3, 단계 4 |
| 11 | [U.S. Air Force — RFPB 인력비용](https://www.af.mil/News/Article-Display/Article/467002/national-commission-reviews-af-life-cycle-manpower-costs/) | 공식(해외) | 예비역 비용 = 현역의 34%(장교)·37%(병) | 비용 비교 |
| 12 | [Econlib — Arthur(1998) 요약](https://www.econlib.org/archives/2016/01/forgetting_the.html) | 2차 | 감쇠-간격 관계, 정확성 d=-1.00 vs 속도 -0.32 | 능력, 단계 5 |
| 13 | [Arthur et al.(1998) 원문 PDF](https://www.gwern.net/doc/psychology/spaced-repetition/1998-arthur.pdf) | 학술 | 메타분석 원문 | 능력, 단계 5 |
| 14 | [이데일리 — 비상근 예비군 법제화 일당 15만·180일](https://edaily.co.kr/News/Read?mediaCodeNo=257&newsId=02948726629276224) | 언론 | 장기 일당 15만·연 180일 (제목 기준) | 현황표 |

## 2. 공식 대조가 필요한 항목 (배포 전 TODO)

| 항목 | 현재 출처 | 대조할 공식 자료 |
|---|---|---|
| 2026 군인 봉급월액 (대위8·상사10·중사10) | [6][7] | 공무원보수규정 별표 13 (국가법령정보센터), 국방부 공지 |
| 2024년 60사단 장기형 선발 4명 | [10] | 육군 보도자료·국방일보 |
| 단기 교통비 지급 및 금액 | [10] | 육군 상비예비군 모집 공고 원문 |
| 2025.2 집중편성부대 확대 기사 원 출처 | [3] | 국방일보 원문 |
| 정원 상한 폐지 시행령 개정 | [4] | 예비군법 시행령 입법예고(국민참여입법센터) |
| 수당률 55%, 간접비, 양성비 | 가정 | 국방부 인건비 집행 자료, KIDA 보고서 |

## 3. 원칙

1. 본문 사실 문장에는 반드시 `[n]` 각주.
2. 새 출처 추가 시 `data/sources.json` → 이 문서 표 → 본문 각주 순으로 반영.
3. 링크 깨짐은 CI 링크 체크(`npm run check:links`, 권장)로 감시.

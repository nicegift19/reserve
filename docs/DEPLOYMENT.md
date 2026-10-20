# 배포 가이드

정적 사이트(`dist/`)이므로 아래 중 하나를 선택한다. 기본은 GitHub Pages.

## A. GitHub Pages (기본, 설정 완료)
- 저장소: https://github.com/nicegift19/reserve
- `vite.config.ts`의 `base: './'`(상대 경로)라 저장소 하위 경로(`/reserve/`)·사용자 도메인 모두 그대로 동작한다.
- `.github/workflows/deploy.yml`: `main`에 push하면 `npm ci → npm test → npm run build → Pages 배포`. 테스트가 실패하면 배포하지 않는다. Actions 탭에서 수동 실행(workflow_dispatch)도 가능.
- **최초 1회**: 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택.
- 배포 주소: `https://nicegift19.github.io/reserve/`

## B. Vercel / Netlify
- Build command `npm run build`, Output `dist`. 저장소 연결만 하면 됨.

## C. 군 내부망 (폐쇄망)
- 폰트는 `@fontsource` 패키지로 셀프 호스팅되어 `dist/assets/`에 함께 빌드된다(외부 CDN 의존 없음). 한글 폰트는 unicode-range 조각으로 나뉘어 필요한 글자만 내려받는다.
- 외부 출처 링크는 내부망에서 열리지 않을 수 있으므로, 출처 목록에 "인터넷망에서 확인" 안내 문구 추가를 검토.
- `dist/` 폴더를 내부 웹서버(정적 파일)에 복사. 하위 경로에 두어도 동작한다.

## 보안 헤더
빌드된 `index.html`에는 CSP 메타 태그가 자동으로 들어간다(`vite.config.ts`의 `csp-meta` 플러그인, 개발 서버 제외).
```
default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'
```
헤더를 설정할 수 있는 플랫폼에서는 추가로:
```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 배포 전 체크리스트
- [ ] `npm test` 통과
- [ ] `docs/SOURCES.md` §2 공식 대조 항목 처리 또는 2차 출처 배지 유지 확인
- [ ] OG 이미지 설정 (현재 제목·설명만 있음)
- [ ] 모바일·다크 모드 확인
- [ ] 모든 외부 링크 열림 확인

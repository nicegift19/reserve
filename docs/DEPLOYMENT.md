# 배포 가이드

정적 사이트(`dist/`)이므로 아래 중 하나를 선택한다. 기본 제안은 GitHub Pages.

## A. GitHub Pages (기본)
1. GitHub 저장소 생성 후 push.
2. `vite.config.ts`에 `base: '/<저장소명>/'` 설정 (사용자 도메인 사용 시 `'/'`).
3. `.github/workflows/deploy.yml` 추가:
```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm test && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```
4. Settings → Pages → Source: GitHub Actions.

## B. Vercel / Netlify
- Build command `npm run build`, Output `dist`. 저장소 연결만 하면 됨.

## C. 군 내부망 (폐쇄망)
- Google Fonts를 `public/fonts/`로 셀프 호스팅하고 `<link>` 제거.
- 외부 출처 링크는 내부망에서 열리지 않을 수 있으므로, 출처 목록에 "인터넷망에서 확인" 안내 문구 추가.
- `dist/` 폴더를 내부 웹서버(정적 파일)에 복사.

## 공통 보안 헤더 (가능한 플랫폼에서)
```
Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 배포 전 체크리스트
- [ ] `npm test` 통과
- [ ] `docs/SOURCES.md` §2 공식 대조 항목 처리 또는 2차 출처 배지 유지 확인
- [ ] OG 이미지·설명 설정
- [ ] 모바일·다크 모드 확인
- [ ] 모든 외부 링크 열림 확인

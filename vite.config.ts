import { defineConfig } from 'vitest/config';

/** 빌드 결과에만 CSP 메타 삽입 (개발 서버는 인라인 스타일 주입이 필요해 제외) */
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'";

export default defineConfig({
  // 상대 경로: GitHub Pages 하위 경로·내부망 정적 서버 어디에 올려도 동작
  base: './',
  // assetsInlineLimit 0: 작은 폰트 조각도 data: URI로 인라인하지 않음 (CSP font-src 'self')
  build: { target: 'es2020', assetsInlineLimit: 0 },
  plugins: [{
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml: html => html.replace('<meta charset="utf-8">',
      `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}">`),
  }],
  test: { environment: 'node' },
});

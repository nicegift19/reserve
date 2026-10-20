import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 상대 경로: GitHub Pages 하위 경로·내부망 정적 서버 어디에 올려도 동작
  base: './',
  build: { target: 'es2020' },
  test: { environment: 'node' },
});

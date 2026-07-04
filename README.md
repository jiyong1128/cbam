# CBAM Korea

EU 탄소국경조정메커니즘(CBAM) 대응 SaaS — 철강·알루미늄·시멘트·비료를 EU에 수출하는 한국 제조사 대상.

## 기능

- **CBAM 대상 판별 위저드** — CN/HS코드 + 연간 수출량 → 대상 여부 및 50톤 임계값 판정
- **연도별 비용 계산기** — 생산방식별 배출계수 × ETS 가격 × CBAM Factor(2026 2.5% → 2034 100%)
- **기본값 vs 실측값 절감 분석** — 기본값 마크업 페널티 대비 검증 데이터 확보 시 절감액 하이라이트

## 데이터 소스

- Regulation (EU) 2023/956 (CBAM Regulation)
- IR 2025/2621 (기본값 / 마크업 스케줄)
- IR 2025/2547 (50톤 de-minimis 임계값)

배출계수·CBAM Factor·마크업은 [`src/lib/cbam-data.ts`](src/lib/cbam-data.ts)에 정적 데이터로 관리되며,
계산 로직은 [`src/lib/cbam-engine.ts`](src/lib/cbam-engine.ts)의 순수 함수로 분리되어 있습니다.

## 기술 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · framer-motion · lucide-react

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## 로드맵

- [ ] IR 2025/2621 Annex 전체 국가×품목 기본값 임포트 (특히 한국 KR)
- [ ] PDF 증빙 패키지 생성 (한/영 병기)
- [ ] Payment 페이지 (Free / Starter / Pro, Stripe 연동)
- [ ] 컨설팅 예약 캘린더
- [ ] EUR-Lex 규정 모니터링 (마크업·CBAM Factor 자동 추적)

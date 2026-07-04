import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, Badge } from "@/components/ui";
import { ArrowRight, Gauge, Calculator, FileText, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Gauge,
    title: "CBAM 대상 판별",
    desc: "CN/HS코드와 연간 EU 수출량만 입력하면 CBAM 신고 의무 대상 여부와 50톤 임계값을 즉시 판정합니다.",
  },
  {
    icon: Calculator,
    title: "연도별 비용 시뮬레이션",
    desc: "생산방식별 배출계수와 CBAM Factor(2026년 2.5% → 2034년 100%)를 반영해 인증서 비용을 연도별로 계산합니다.",
  },
  {
    icon: ShieldCheck,
    title: "기본값 vs 실측값 절감 분석",
    desc: "기본값(마크업 포함)과 검증된 실측 배출계수를 비교해, 실측 데이터 확보 시 절감되는 금액을 하이라이트합니다.",
  },
  {
    icon: FileText,
    title: "증빙 패키지 생성",
    desc: "EU 바이어에게 제출할 배출량 증빙 리포트를 한글·영문 병기로 생성합니다. (준비 중)",
  },
];

const SECTORS = [
  { name: "철강", note: "BF-BOF · DRI-EAF · Scrap-EAF" },
  { name: "알루미늄", note: "1차 · 2차(재활용)" },
  { name: "시멘트", note: "클링커 · 포틀랜드" },
  { name: "비료", note: "요소 · 질소비료" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pb-24 pt-36 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Badge variant="emerald" className="mb-5">2026년 CBAM 본격 시행 대응</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            EU 탄소국경조정(CBAM),<br />
            <span className="text-emerald-400">수출 비용을 미리 계산</span>하세요
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300">
            철강·알루미늄·시멘트·비료를 EU에 수출하는 한국 제조사를 위한 CBAM 대응 플랫폼.
            대상 판별부터 연도별 인증서 비용, 실측 데이터 절감액까지 한 번에.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools/cbam-calculator">
              <Button variant="emerald" size="lg">
                무료 비용 계산 시작 <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">요금제 보기</Button>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SECTORS.map((s) => (
              <div key={s.name} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-bold text-white">{s.name}</div>
                <div className="mt-1 text-xs text-slate-400">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-navy-900">CBAM 대응, 이렇게 준비하세요</h2>
          <p className="mt-3 text-sm text-slate-600">복잡한 규정을 입력 몇 번으로 정리합니다.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} hover>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-navy-900">우리 회사 CBAM 비용, 지금 확인하세요</h2>
          <p className="mt-3 text-sm text-slate-600">
            CN코드와 수출량만 있으면 1분 안에 연도별 예상 비용과 절감 가능액을 볼 수 있습니다.
          </p>
          <Link href="/tools/cbam-calculator" className="mt-6 inline-block">
            <Button variant="emerald" size="lg">
              무료 계산기 열기 <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

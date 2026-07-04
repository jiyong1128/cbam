"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertTriangle,
  Factory, Gauge, TrendingDown, Info, Sparkles,
} from "lucide-react";
import {
  CBAM_GOODS, PRODUCTION_ROUTES, DEFAULT_ETS_PRICE_EUR,
  getGoodByCnCode, getRoutesForSector, getDefaultValue,
  type CbamSector,
} from "@/lib/cbam-data";
import {
  runDiagnosis, compareDefaultVsActual, formatEur,
  type DiagnosisResult, type ComparisonResult,
} from "@/lib/cbam-engine";

const STEPS = ["대상 판별", "생산방식·배출계수", "비용 시뮬레이션"];

const SECTOR_LABELS: Record<CbamSector, string> = {
  iron_steel: "철강",
  aluminium: "알루미늄",
  cement: "시멘트",
  fertilisers: "비료",
  hydrogen: "수소",
  electricity: "전력",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function CbamCalculatorPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Step 1 — diagnosis inputs
  const [cnCode, setCnCode] = useState("");
  const [annualTonnes, setAnnualTonnes] = useState("");

  // Step 2 — factors
  const [routeId, setRouteId] = useState("");
  const [actualFactor, setActualFactor] = useState("");
  const [countryCode, setCountryCode] = useState("CN");
  const [etsPrice, setEtsPrice] = useState(String(DEFAULT_ETS_PRICE_EUR));

  const diagnosis: DiagnosisResult | null = useMemo(() => {
    if (!cnCode.trim() || !annualTonnes) return null;
    return runDiagnosis({ cnCode: cnCode.trim(), annualExportTonnes: Number(annualTonnes) });
  }, [cnCode, annualTonnes]);

  const sector = diagnosis?.sector;
  const routes = sector ? getRoutesForSector(sector) : [];
  const selectedRoute = PRODUCTION_ROUTES.find((r) => r.id === routeId);

  // resolve a default value: country table if available, else the selected route benchmark
  const countryDefault = diagnosis?.good ? getDefaultValue(diagnosis.good.id, countryCode) : undefined;
  const defaultFactor = countryDefault?.seeTotal ?? selectedRoute?.seeTotal;

  const comparison: ComparisonResult | null = useMemo(() => {
    if (!sector || defaultFactor == null || !actualFactor || !annualTonnes) return null;
    return compareDefaultVsActual({
      sector,
      quantityTonnes: Number(annualTonnes),
      defaultEmissionFactor: defaultFactor,
      actualEmissionFactor: Number(actualFactor),
      etsPriceEur: Number(etsPrice) || DEFAULT_ETS_PRICE_EUR,
    });
  }, [sector, defaultFactor, actualFactor, annualTonnes, etsPrice]);

  function go(nextStep: number) {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  const canAdvanceStep1 = diagnosis?.obligated;
  const canAdvanceStep2 = defaultFactor != null && !!actualFactor;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28">
        <Link href="/tools" className="mb-6 inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900">
          <ArrowLeft className="h-4 w-4" /> 툴 목록으로
        </Link>

        <div className="mb-8">
          <Badge variant="navy" className="mb-3">CBAM 탄소국경조정메커니즘</Badge>
          <h1 className="text-3xl font-bold text-navy-900">CBAM 비용 계산기</h1>
          <p className="mt-2 text-sm text-slate-600">
            EU에 철강·알루미늄·시멘트·비료를 수출하는 제조사를 위한 대상 판별 및 연도별 인증서 비용 시뮬레이션입니다.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i === step ? "bg-navy-900 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-navy-900" : "text-slate-500")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          {/* ---------------- STEP 1: DIAGNOSIS ---------------- */}
          {step === 0 && (
            <motion.div key="step0" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <Card>
                <CardHeaderRow icon={<Gauge className="h-5 w-5" />} title="1단계 · CBAM 대상 여부 판별" subtitle="CN코드와 연간 EU 수출량을 입력하세요" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="CN코드 / HS코드"
                    placeholder="예: 7207 (철강 슬래브)"
                    value={cnCode}
                    onChange={(e) => setCnCode(e.target.value)}
                  />
                  <Input
                    label="연간 EU 수출량 (톤)"
                    type="number"
                    placeholder="예: 500"
                    value={annualTonnes}
                    onChange={(e) => setAnnualTonnes(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400">빠른 예시:</span>
                  {[
                    { label: "철강 슬래브 7207", cn: "7207", t: "500" },
                    { label: "알루미늄 괴 7601", cn: "7601", t: "300" },
                    { label: "포틀랜드 시멘트 252329", cn: "252329", t: "1000" },
                  ].map((ex) => (
                    <button
                      key={ex.cn}
                      onClick={() => { setCnCode(ex.cn); setAnnualTonnes(ex.t); }}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-navy-300 hover:bg-navy-50"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                {diagnosis && (
                  <div className={cn(
                    "mt-6 rounded-lg border p-4",
                    diagnosis.obligated ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
                  )}>
                    <div className="flex items-start gap-3">
                      {diagnosis.obligated
                        ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        : <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
                      <div>
                        <p className="text-sm font-semibold text-navy-900">
                          {diagnosis.obligated ? "CBAM 신고 의무 대상입니다" : diagnosis.isCovered ? "대상 품목이나 임계값 미만 (면제)" : "CBAM 비대상 품목"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{diagnosis.reasonKo}</p>
                        {diagnosis.good && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="navy">{diagnosis.good.nameKo}</Badge>
                            {diagnosis.sector && <Badge>{SECTOR_LABELS[diagnosis.sector]}</Badge>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => go(1)} disabled={!canAdvanceStep1}>
                    다음: 배출계수 입력 <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ---------------- STEP 2: FACTORS ---------------- */}
          {step === 1 && (
            <motion.div key="step1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <Card>
                <CardHeaderRow icon={<Factory className="h-5 w-5" />} title="2단계 · 생산방식 및 배출계수" subtitle="자사 생산방식과 검증된 실측 배출계수를 입력하세요" />

                {routes.length > 0 && (
                  <div className="mb-5">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">생산방식 (벤치마크 배출계수)</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {routes.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setRouteId(r.id)}
                          className={cn(
                            "rounded-lg border p-3 text-left transition-colors",
                            routeId === r.id ? "border-navy-500 bg-navy-50 ring-2 ring-navy-200" : "border-slate-200 hover:border-navy-300"
                          )}
                        >
                          <div className="text-sm font-semibold text-navy-900">{r.nameKo}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{r.seeTotal} tCO₂e/t</div>
                          {r.noteKo && <div className="mt-1 text-xs text-slate-400">{r.noteKo}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">수출 대상국 기본값 테이블</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
                    >
                      <option value="CN">중국 (China)</option>
                      <option value="TR">튀르키예 (Türkiye)</option>
                      <option value="OTHER">기타 국가 (Other countries)</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-400">
                      {countryDefault
                        ? `국가 기본값 적용: ${countryDefault.seeTotal} tCO₂e/t`
                        : `국가 기본값 없음 → 생산방식 벤치마크(${selectedRoute?.seeTotal ?? "—"}) 사용`}
                    </p>
                  </div>
                  <Input
                    label="검증된 실측 배출계수 (tCO₂e/t)"
                    type="number"
                    step="0.001"
                    placeholder="예: 0.072"
                    value={actualFactor}
                    onChange={(e) => setActualFactor(e.target.value)}
                  />
                </div>

                <div className="mt-4 max-w-xs">
                  <Input
                    label="EU ETS 인증서 가격 (€/tCO₂e)"
                    type="number"
                    value={etsPrice}
                    onChange={(e) => setEtsPrice(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-100 p-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <p className="text-xs text-slate-600">
                    기본값(Default)에는 연도별 마크업(2026년 10% → 2028년 30%, 비료 1%)이 부과됩니다.
                    검증된 실측값에는 마크업이 없어 비용이 크게 절감됩니다.
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="secondary" onClick={() => go(0)}><ArrowLeft className="mr-1.5 h-4 w-4" /> 이전</Button>
                  <Button onClick={() => go(2)} disabled={!canAdvanceStep2}>
                    비용 시뮬레이션 보기 <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ---------------- STEP 3: SIMULATION ---------------- */}
          {step === 2 && comparison && (
            <motion.div key="step2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <Card>
                <CardHeaderRow icon={<TrendingDown className="h-5 w-5" />} title="3단계 · 연도별 CBAM 비용 시뮬레이션" subtitle="기본값(마크업 포함) vs 검증 실측값 비용 비교" />

                <div className="mb-6 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-semibold">검증 데이터 확보 시 총 절감액 (2026~2034 누적)</span>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-emerald-700">{formatEur(comparison.totalSavingsEur)}</div>
                  <p className="mt-1 text-xs text-slate-500">
                    연간 {comparison.quantityTonnes.toLocaleString()}t 기준 · ETS {formatEur(comparison.etsPriceEur)}/t 가정
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>연도</TableHead>
                      <TableHead>실부담률</TableHead>
                      <TableHead className="text-right">기본값 비용</TableHead>
                      <TableHead className="text-right">실측값 비용</TableHead>
                      <TableHead className="text-right">절감액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison.perYear.map((y) => (
                      <TableRow key={y.year}>
                        <TableCell className="font-medium text-navy-900">{y.year}</TableCell>
                        <TableCell>{comparison.defaultScenario.years.find((d) => d.year === y.year)?.cbamFactorPct}%</TableCell>
                        <TableCell className="text-right text-slate-600">{formatEur(y.defaultCostEur)}</TableCell>
                        <TableCell className="text-right text-slate-900">{formatEur(y.actualCostEur)}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          {formatEur(y.savingsEur)} <span className="text-xs text-emerald-500">({y.savingsPct.toFixed(0)}%)</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-navy-900">다음 단계</p>
                  <p className="mt-1 text-sm text-slate-600">
                    이 시뮬레이션을 PDF 증빙 리포트로 발급하고, EU 바이어 제출용 배출량 증빙 패키지를 자동 생성할 수 있습니다.
                    복잡 케이스(다중 전구물질, PPA 전력계약)는 전문가 컨설팅을 예약하세요.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="emerald" size="sm">리포트 PDF 발급 ($29)</Button>
                    <Link href="/consulting"><Button variant="secondary" size="sm">컨설팅 예약</Button></Link>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="secondary" onClick={() => go(1)}><ArrowLeft className="mr-1.5 h-4 w-4" /> 이전</Button>
                  <Button variant="ghost" onClick={() => { setStep(0); setCnCode(""); setAnnualTonnes(""); setRouteId(""); setActualFactor(""); }}>
                    새로 계산
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function CardHeaderRow({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 text-navy-700">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-navy-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

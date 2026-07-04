// CBAM Cost & Diagnosis Engine
// Pure calculation layer over cbam-data.ts (mirrors dfr-engine.ts over dfr-streams.ts).
//
// Core formula (Reg. (EU) 2023/956 Art. 21 / IR 2025/2621):
//   payable cost = quantity(t)
//                × embedded emissions factor (tCO2e/t)   [× markup if default value]
//                × ETS price (€/tCO2e)
//                × CBAM factor (free-allocation phase-out share)
//
// The commercial hook of the product is the Default-vs-Actual delta: default values
// carry a rising markup AND are usually far higher than a plant's verified emissions,
// so the engine surfaces exactly how much money a verified figure saves per year.

import {
  CBAM_FACTOR_SCHEDULE,
  DE_MINIMIS_THRESHOLD_T,
  DEFAULT_ETS_PRICE_EUR,
  getCbamFactor,
  getDefaultValue,
  getGoodByCnCode,
  getMarkupMultiplier,
  type CbamGood,
  type CbamSector,
} from "./cbam-data";

// ============================================================
// DIAGNOSIS (핵심 기능 1 — 대상 판별 위저드)
// ============================================================

export interface DiagnosisInput {
  cnCode: string;
  /** annual export mass to the EU, tonnes */
  annualExportTonnes: number;
}

export interface DiagnosisResult {
  isCovered: boolean;
  good?: CbamGood;
  sector?: CbamSector;
  aboveThreshold: boolean;
  thresholdTonnes: number;
  /** true only when the good is covered AND mass ≥ threshold */
  obligated: boolean;
  reasonKo: string;
  reasonEn: string;
}

export function runDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const good = getGoodByCnCode(input.cnCode);
  const isCovered = good !== undefined;
  const aboveThreshold = input.annualExportTonnes >= DE_MINIMIS_THRESHOLD_T;
  const obligated = isCovered && aboveThreshold;

  let reasonKo: string;
  let reasonEn: string;
  if (!isCovered) {
    reasonKo = `CN코드 ${input.cnCode}는 CBAM 대상 품목이 아닙니다. 현재 규정상 신고 의무가 없습니다.`;
    reasonEn = `CN code ${input.cnCode} is not a CBAM-covered good. No declaration obligation under the current scope.`;
  } else if (!aboveThreshold) {
    reasonKo = `${good.nameKo}는 CBAM 대상 품목이지만, 연간 수출량 ${input.annualExportTonnes}t이 면제 임계값 ${DE_MINIMIS_THRESHOLD_T}t 미만이라 신고 의무가 면제됩니다 (IR 2025/2547).`;
    reasonEn = `${good.nameEn} is covered, but ${input.annualExportTonnes}t/yr is below the ${DE_MINIMIS_THRESHOLD_T}t de-minimis threshold — exempt (IR 2025/2547).`;
  } else {
    reasonKo = `${good.nameKo}는 CBAM 대상이며 연간 ${input.annualExportTonnes}t이 임계값 ${DE_MINIMIS_THRESHOLD_T}t을 초과합니다. 배출량 신고 및 인증서 구매 의무가 발생합니다.`;
    reasonEn = `${good.nameEn} is covered and ${input.annualExportTonnes}t/yr exceeds the ${DE_MINIMIS_THRESHOLD_T}t threshold — declaration and certificate obligations apply.`;
  }

  return {
    isCovered,
    good,
    sector: good?.sector,
    aboveThreshold,
    thresholdTonnes: DE_MINIMIS_THRESHOLD_T,
    obligated,
    reasonKo,
    reasonEn,
  };
}

// ============================================================
// COST CALCULATION (핵심 기능 2 — 배출량 계산기)
// ============================================================

export interface CostScenarioInput {
  sector: CbamSector;
  /** annual quantity, tonnes */
  quantityTonnes: number;
  /** embedded emissions factor, tCO2e/t */
  emissionFactor: number;
  /** true if factor is a country default value → year-dependent markup applies */
  isDefaultValue: boolean;
  /** ETS price, €/tCO2e (defaults to reference price) */
  etsPriceEur?: number;
}

export interface YearCost {
  year: number;
  cbamFactorPct: number;
  markupMultiplier: number;
  /** effective factor after markup, tCO2e/t */
  effectiveEmissionFactor: number;
  /** total embedded emissions billed this year, tCO2e */
  billedEmissionsTonnes: number;
  /** payable cost, € */
  costEur: number;
}

export interface CostScenarioResult {
  etsPriceEur: number;
  quantityTonnes: number;
  years: YearCost[];
}

/**
 * Year-by-year payable cost for one emission-factor scenario across the CBAM
 * phase-in (2026→2034). Markup only applies to default values.
 */
export function calcCostScenario(input: CostScenarioInput): CostScenarioResult {
  const etsPriceEur = input.etsPriceEur ?? DEFAULT_ETS_PRICE_EUR;

  const years: YearCost[] = CBAM_FACTOR_SCHEDULE.map(({ year, factorPct }) => {
    const markupMultiplier = input.isDefaultValue
      ? getMarkupMultiplier(year, input.sector)
      : 1;
    const effectiveEmissionFactor = input.emissionFactor * markupMultiplier;
    const cbamFactor = getCbamFactor(year);
    const billedEmissionsTonnes =
      input.quantityTonnes * effectiveEmissionFactor * cbamFactor;
    const costEur = billedEmissionsTonnes * etsPriceEur;

    return {
      year,
      cbamFactorPct: factorPct,
      markupMultiplier,
      effectiveEmissionFactor,
      billedEmissionsTonnes,
      costEur,
    };
  });

  return { etsPriceEur, quantityTonnes: input.quantityTonnes, years };
}

// ============================================================
// DEFAULT vs ACTUAL COMPARISON (the commercial hook)
// ============================================================

export interface ComparisonInput {
  sector: CbamSector;
  quantityTonnes: number;
  /** country default value, tCO2e/t (markup applies) */
  defaultEmissionFactor: number;
  /** plant's verified actual value, tCO2e/t (no markup) */
  actualEmissionFactor: number;
  etsPriceEur?: number;
}

export interface ComparisonYear {
  year: number;
  defaultCostEur: number;
  actualCostEur: number;
  savingsEur: number;
  savingsPct: number;
}

export interface ComparisonResult {
  etsPriceEur: number;
  quantityTonnes: number;
  defaultScenario: CostScenarioResult;
  actualScenario: CostScenarioResult;
  perYear: ComparisonYear[];
  /** cumulative savings across the whole phase-in window, € */
  totalSavingsEur: number;
}

/**
 * The money shot: side-by-side Default (with markup) vs verified Actual, plus the
 * per-year and cumulative savings a customer unlocks by obtaining verified data.
 */
export function compareDefaultVsActual(input: ComparisonInput): ComparisonResult {
  const etsPriceEur = input.etsPriceEur ?? DEFAULT_ETS_PRICE_EUR;

  const defaultScenario = calcCostScenario({
    sector: input.sector,
    quantityTonnes: input.quantityTonnes,
    emissionFactor: input.defaultEmissionFactor,
    isDefaultValue: true,
    etsPriceEur,
  });

  const actualScenario = calcCostScenario({
    sector: input.sector,
    quantityTonnes: input.quantityTonnes,
    emissionFactor: input.actualEmissionFactor,
    isDefaultValue: false,
    etsPriceEur,
  });

  const perYear: ComparisonYear[] = defaultScenario.years.map((d, i) => {
    const a = actualScenario.years[i];
    const savingsEur = d.costEur - a.costEur;
    const savingsPct = d.costEur > 0 ? (savingsEur / d.costEur) * 100 : 0;
    return {
      year: d.year,
      defaultCostEur: d.costEur,
      actualCostEur: a.costEur,
      savingsEur,
      savingsPct,
    };
  });

  const totalSavingsEur = perYear.reduce((sum, y) => sum + y.savingsEur, 0);

  return {
    etsPriceEur,
    quantityTonnes: input.quantityTonnes,
    defaultScenario,
    actualScenario,
    perYear,
    totalSavingsEur,
  };
}

/**
 * Convenience wrapper: resolve the country default value from the DB, then compare
 * against a plant's verified actual figure. Returns undefined if no default exists.
 */
export function compareForCountry(args: {
  goodId: string;
  countryCode: string;
  sector: CbamSector;
  quantityTonnes: number;
  actualEmissionFactor: number;
  etsPriceEur?: number;
}): ComparisonResult | undefined {
  const def = getDefaultValue(args.goodId, args.countryCode);
  if (!def) return undefined;
  return compareDefaultVsActual({
    sector: args.sector,
    quantityTonnes: args.quantityTonnes,
    defaultEmissionFactor: def.seeTotal,
    actualEmissionFactor: args.actualEmissionFactor,
    etsPriceEur: args.etsPriceEur,
  });
}

// ============================================================
// FORMATTING HELPERS (UI/PDF share these)
// ============================================================

export function formatEur(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTonnes(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)} tCO₂e`;
}

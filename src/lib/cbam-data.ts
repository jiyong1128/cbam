// CBAM Emission Factor Database
// Sources:
//   - Regulation (EU) 2023/956 (CBAM Regulation)
//   - IR 2025/2621 (default values per country/good, markup schedule)
//   - IR 2025/2547 (simplifications, 50t de-minimis threshold)
// Structure mirrors dfr-streams.ts (RecyClass DfR DB): typed static data +
// bilingual labels (En/Ko) + pure lookup helpers. Calculation logic lives in
// cbam-engine.ts (to be added), mirroring dfr-engine.ts.

// ============================================================
// TYPES
// ============================================================

export type CbamSector =
  | "iron_steel"
  | "aluminium"
  | "cement"
  | "fertilisers"
  | "hydrogen"
  | "electricity";

/** How an emission factor value was determined */
export type ValueType =
  | "benchmark" // EU ETS benchmark per production route
  | "default" // IR 2025/2621 country/good default value (markup applies)
  | "actual"; // verified actual embedded emissions (no markup)

export interface CbamGood {
  id: string;
  sector: CbamSector;
  /** CN code prefixes covered by this good (used by the diagnosis wizard) */
  cnCodes: string[];
  nameEn: string;
  nameKo: string;
  /** true if this good is also a relevant precursor for complex goods */
  isPrecursor: boolean;
  /** measurement unit for quantity */
  unit: "t" | "MWh";
}

/** Production route with EU benchmark specific embedded emissions (SEE) */
export interface ProductionRoute {
  id: string;
  sector: CbamSector;
  nameEn: string;
  nameKo: string;
  /** benchmark SEE, tCO2e per unit (direct + indirect where noted) */
  seeTotal: number;
  seeDirect?: number;
  seeIndirect?: number;
  source: string;
  noteKo?: string;
}

/** Country-specific default value (IR 2025/2621). Fallback country = "OTHER". */
export interface DefaultValue {
  id: string;
  goodId: string;
  /** ISO 3166-1 alpha-2, or "OTHER" for the "Other countries" table */
  countryCode: string;
  countryNameEn: string;
  countryNameKo: string;
  /** tCO2e per unit */
  seeTotal: number;
  seeDirect?: number;
  seeIndirect?: number;
  source: string;
  /** ISO date the value applies from (regulation validity window) */
  validFrom: string;
  validTo?: string;
  noteKo?: string;
}

/** Markup (%) added on top of default values, by year and sector group */
export interface MarkupRow {
  year: number;
  /** steel / cement / aluminium / hydrogen */
  generalPct: number;
  /** fertilisers get a reduced markup */
  fertilisersPct: number;
  source: string;
}

/** CBAM factor = share of embedded emissions actually payable (free-allocation phase-out) */
export interface CbamFactorRow {
  year: number;
  /** percent, e.g. 2.5 means 2.5% */
  factorPct: number;
}

// ============================================================
// GOODS (CN code coverage for the diagnosis wizard)
// ============================================================

export const CBAM_GOODS: CbamGood[] = [
  {
    id: "steel_slab",
    sector: "iron_steel",
    cnCodes: ["7207"],
    nameEn: "Steel slabs / semi-finished products",
    nameKo: "철강 슬래브 / 반제품",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "crude_steel",
    sector: "iron_steel",
    cnCodes: ["72", "7301", "7302", "7303", "7304", "7305", "7306", "7307", "7308", "7309", "7310", "7311", "7318", "7326"],
    nameEn: "Iron & steel products",
    nameKo: "철강 제품",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "aluminium_primary",
    sector: "aluminium",
    cnCodes: ["7601"],
    nameEn: "Unwrought aluminium",
    nameKo: "알루미늄 괴 (미가공)",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "aluminium_products",
    sector: "aluminium",
    cnCodes: ["7603", "7604", "7605", "7606", "7607", "7608", "7609", "7610", "7611", "7612", "7613", "7614", "7616"],
    nameEn: "Aluminium products",
    nameKo: "알루미늄 제품",
    isPrecursor: false,
    unit: "t",
  },
  {
    id: "cement_portland",
    sector: "cement",
    cnCodes: ["252321", "252329"],
    nameEn: "Portland cement",
    nameKo: "포틀랜드 시멘트",
    isPrecursor: false,
    unit: "t",
  },
  {
    id: "cement_clinker",
    sector: "cement",
    cnCodes: ["252310"],
    nameEn: "Cement clinker",
    nameKo: "시멘트 클링커",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "urea",
    sector: "fertilisers",
    cnCodes: ["310210", "31028000"],
    nameEn: "Urea",
    nameKo: "요소 (우레아)",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "fertilisers_other",
    sector: "fertilisers",
    cnCodes: ["2808", "2814", "28342100", "3102", "3105"],
    nameEn: "Nitrogen fertilisers / ammonia / nitric acid",
    nameKo: "질소비료 / 암모니아 / 질산",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "hydrogen",
    sector: "hydrogen",
    cnCodes: ["280410"],
    nameEn: "Hydrogen",
    nameKo: "수소",
    isPrecursor: true,
    unit: "t",
  },
  {
    id: "electricity",
    sector: "electricity",
    cnCodes: ["27160000"],
    nameEn: "Electricity",
    nameKo: "전력",
    isPrecursor: true,
    unit: "MWh",
  },
];

// ============================================================
// PRODUCTION ROUTES (EU benchmark SEE)
// ============================================================

export const PRODUCTION_ROUTES: ProductionRoute[] = [
  {
    id: "bf_bof",
    sector: "iron_steel",
    nameEn: "BF-BOF (Blast Furnace – Basic Oxygen Furnace)",
    nameKo: "BF-BOF (고로-전로)",
    seeTotal: 1.37,
    source: "IR 2025/2621",
    noteKo: "한국 일관제철소(포스코, 현대제철 고로) 대부분 해당",
  },
  {
    id: "dri_eaf",
    sector: "iron_steel",
    nameEn: "DRI-EAF (Direct Reduced Iron – Electric Arc Furnace)",
    nameKo: "DRI-EAF (직접환원철-전기로)",
    seeTotal: 0.481,
    source: "IR 2025/2621",
  },
  {
    id: "scrap_eaf",
    sector: "iron_steel",
    nameEn: "Scrap-EAF (Scrap-based Electric Arc Furnace)",
    nameKo: "Scrap-EAF (고철-전기로)",
    seeTotal: 0.072,
    source: "IR 2025/2621",
    noteKo: "고철 기반 전기로 — 배출계수가 BF-BOF의 약 1/19 수준",
  },
  {
    id: "al_primary",
    sector: "aluminium",
    nameEn: "Primary aluminium (electrolysis)",
    nameKo: "1차 알루미늄 (전해)",
    seeTotal: 1.464,
    source: "IR 2025/2621",
  },
  {
    id: "al_secondary",
    sector: "aluminium",
    nameEn: "Secondary aluminium (≥50% scrap input)",
    nameKo: "2차 알루미늄 (재활용, 스크랩 50% 이상)",
    seeTotal: 0.139,
    source: "IR 2025/2621",
    noteKo: "스크랩 투입 비중 50% 이상 입증 시 적용",
  },
  {
    id: "cement_portland_route",
    sector: "cement",
    nameEn: "Portland cement (direct + indirect)",
    nameKo: "포틀랜드 시멘트 (직접+간접 배출 포함)",
    seeTotal: 0.83,
    source: "IR 2025/2621",
    noteKo: "석회석 소성(calcination)이 전체 배출의 약 60% 기여 (0.785 tCO2e/t CaCO3 기준)",
  },
  {
    id: "urea_route",
    sector: "fertilisers",
    nameEn: "Urea production",
    nameKo: "요소 생산",
    seeTotal: 2.45, // midpoint of 2.3–2.6 range
    source: "IR 2025/2621",
    noteKo: "범위 2.3~2.6 tCO2e/t — 공정별 편차 존재, 중간값 사용",
  },
];

// ============================================================
// COUNTRY DEFAULT VALUES (IR 2025/2621)
// "OTHER" = "Other countries" fallback table for unlisted countries
// ============================================================

export const DEFAULT_VALUES: DefaultValue[] = [
  {
    id: "cn_steel_slab",
    goodId: "steel_slab",
    countryCode: "CN",
    countryNameEn: "China",
    countryNameKo: "중국",
    seeTotal: 3.167,
    source: "IR 2025/2621 Annex (country default values)",
    validFrom: "2026-01-01",
    noteKo: "중국산 철강 슬래브 기본값 — BF-BOF 벤치마크(1.37)의 2.3배. 실측값 확보 시 절감폭이 매우 큼",
  },
  {
    id: "tr_cement_portland",
    goodId: "cement_portland",
    countryCode: "TR",
    countryNameEn: "Türkiye",
    countryNameKo: "튀르키예",
    seeTotal: 1.584,
    source: "IR 2025/2621 Annex (country default values)",
    validFrom: "2026-01-01",
    noteKo: "포틀랜드 시멘트 벤치마크(0.83) 대비 약 1.9배 — 실측값 사용 시 절감 사례의 대표 예시",
  },
  // TODO(2단계): IR 2025/2621 Annex 전체 국가×품목 기본값 테이블 임포트
  // (한국 KR 철강/알루미늄 기본값 포함 — 한국 제조사 타겟이므로 최우선)
  // "OTHER" 테이블 값도 Annex에서 추출해 채울 것.
];

// ============================================================
// MARKUP SCHEDULE (penalty for using default values)
// ============================================================

export const MARKUP_SCHEDULE: MarkupRow[] = [
  { year: 2026, generalPct: 10, fertilisersPct: 1, source: "IR 2025/2621" },
  { year: 2027, generalPct: 20, fertilisersPct: 1, source: "IR 2025/2621" },
  { year: 2028, generalPct: 30, fertilisersPct: 1, source: "IR 2025/2621" },
];

// ============================================================
// CBAM FACTOR (free-allocation phase-out → actual payable share)
// Reg. (EU) 2023/956 Art. 31 / ETS Directive free allocation schedule
// ============================================================

export const CBAM_FACTOR_SCHEDULE: CbamFactorRow[] = [
  { year: 2026, factorPct: 2.5 },
  { year: 2027, factorPct: 5 },
  { year: 2028, factorPct: 10 },
  { year: 2029, factorPct: 22.5 },
  { year: 2030, factorPct: 48.5 },
  { year: 2031, factorPct: 61 },
  { year: 2032, factorPct: 73.5 },
  { year: 2033, factorPct: 86 },
  { year: 2034, factorPct: 100 },
];

/** De-minimis threshold: importers below this annual mass are exempt (IR 2025/2547) */
export const DE_MINIMIS_THRESHOLD_T = 50;

/** Reference ETS price used for simulations when no live price is provided (€/tCO2e) */
export const DEFAULT_ETS_PRICE_EUR = 75;

// ============================================================
// LOOKUP HELPERS (pure functions — engine uses these)
// ============================================================

export function getGoodByCnCode(cnCode: string): CbamGood | undefined {
  const normalized = cnCode.replace(/\s/g, "");
  // longest-prefix match so e.g. 252310 (clinker) wins over 2523 coverage
  let best: { good: CbamGood; len: number } | undefined;
  for (const good of CBAM_GOODS) {
    for (const prefix of good.cnCodes) {
      if (normalized.startsWith(prefix) && (!best || prefix.length > best.len)) {
        best = { good, len: prefix.length };
      }
    }
  }
  return best?.good;
}

export function isCbamCovered(cnCode: string): boolean {
  return getGoodByCnCode(cnCode) !== undefined;
}

/** Country default value with fallback to the "Other countries" table */
export function getDefaultValue(goodId: string, countryCode: string): DefaultValue | undefined {
  return (
    DEFAULT_VALUES.find((d) => d.goodId === goodId && d.countryCode === countryCode) ??
    DEFAULT_VALUES.find((d) => d.goodId === goodId && d.countryCode === "OTHER")
  );
}

export function getRoutesForSector(sector: CbamSector): ProductionRoute[] {
  return PRODUCTION_ROUTES.filter((r) => r.sector === sector);
}

/** CBAM factor for a given year (fraction, e.g. 0.025). Clamped to schedule bounds. */
export function getCbamFactor(year: number): number {
  const first = CBAM_FACTOR_SCHEDULE[0];
  const last = CBAM_FACTOR_SCHEDULE[CBAM_FACTOR_SCHEDULE.length - 1];
  if (year <= first.year) return year < first.year ? 0 : first.factorPct / 100;
  if (year >= last.year) return last.factorPct / 100;
  const row = CBAM_FACTOR_SCHEDULE.find((r) => r.year === year);
  return (row?.factorPct ?? last.factorPct) / 100;
}

/** Markup multiplier applied when default values are used (e.g. 1.10 for 10%) */
export function getMarkupMultiplier(year: number, sector: CbamSector): number {
  const schedule = [...MARKUP_SCHEDULE].sort((a, b) => a.year - b.year);
  const row =
    schedule.find((r) => r.year === year) ??
    (year > schedule[schedule.length - 1].year ? schedule[schedule.length - 1] : undefined);
  if (!row) return 1;
  const pct = sector === "fertilisers" ? row.fertilisersPct : row.generalPct;
  return 1 + pct / 100;
}

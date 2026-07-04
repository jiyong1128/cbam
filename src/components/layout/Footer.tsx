import Link from "next/link";

const DISCLAIMER =
  "본 계산 결과는 참고용이며, 실제 EU CBAM 규정 준수의 최종 책임은 각 기업에 있습니다. 배출계수·마크업·CBAM Factor 등은 EU 규정 개정에 따라 변경될 수 있으며, IR 2025/2621 등 원문을 반드시 확인하시기 바랍니다.";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-xs font-bold tracking-wide text-white">
                CB
              </div>
              <span className="text-sm font-semibold tracking-wide">CBAM Korea</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              EU에 철강·알루미늄·시멘트·비료를 수출하는 한국 제조사를 위한 CBAM 대응 플랫폼. 대상 판별부터 배출량 계산, 증빙 패키지 생성까지.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">서비스</h4>
            <ul className="space-y-2.5">
              <li><Link href="/tools/cbam-calculator" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">비용 계산기</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">요금제</Link></li>
              <li><Link href="/consulting" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">전문가 컨설팅</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">자료</h4>
            <ul className="space-y-2.5">
              <li><a href="https://eur-lex.europa.eu" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">EUR-Lex CBAM 규정</a></li>
              <li><span className="text-sm text-slate-500">배출계수 DB</span></li>
              <li><span className="text-sm text-slate-500">CBAM Factor 스케줄</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">회사</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">소개</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">문의</Link></li>
            </ul>
          </div>
        </div>

        <div className="mb-6 border-t border-slate-700/50 pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500">{DISCLAIMER}</p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CBAM Korea. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-emerald-400">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

const apps = [
  {
    href: "/game",
    emoji: "🧮",
    title: "인수분해 마스터",
    subtitle: "Factorization Game",
    description:
      "제한 시간 60초 안에 최대한 많은 인수분해 문제를 풀어 최고 점수를 달성하세요. 콤보를 쌓을수록 점수가 최대 3배까지 올라갑니다.",
    tags: ["수학", "게임", "랭킹"],
    gradient: "from-indigo-500 to-purple-600",
    glow: "shadow-indigo-500/20",
    badge: "🏆 리더보드 지원",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    href: "/essay",
    emoji: "✍️",
    title: "AI 논술 문항 생성기",
    subtitle: "Essay Question Generator",
    description:
      "주제만 입력하면 AI가 학교급과 난이도에 맞는 논술형 평가 문항과 채점 기준을 자동으로 생성합니다. 선생님의 수업 준비를 도와드립니다.",
    tags: ["AI", "논술", "평가"],
    gradient: "from-violet-500 to-pink-600",
    glow: "shadow-violet-500/20",
    badge: "✨ GPT-4o-mini 구동",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 border border-indigo-500/20 mb-6">
            🎓 선생님과 학생을 위한 교육 플랫폼
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            에듀빌더로
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              더 스마트한 교육을
            </span>
          </h1>

          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            게임형 수학 학습부터 AI 기반 논술 평가 문항 생성까지,
            <br className="hidden sm:block" />
            에듀빌더의 도구로 수업을 더욱 풍부하게 만들어보세요.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-500 font-semibold">
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>무료 사용</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>로그인 불필요</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>즉시 사용 가능</span>
          </div>
        </div>
      </div>

      {/* App Cards */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          사용 가능한 도구
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className={`group relative bg-slate-900/60 border border-slate-800 rounded-3xl p-7 shadow-2xl ${app.glow} hover:border-slate-700 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 overflow-hidden`}
            >
              {/* Card top gradient line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${app.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Background glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl pointer-events-none`}
              />

              {/* Icon */}
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-3xl shadow-lg mb-5`}
              >
                {app.emoji}
              </div>

              {/* Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${app.badgeColor} mb-3`}
              >
                {app.badge}
              </span>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-white mb-1 group-hover:text-white/90 transition-colors">
                {app.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase mb-3">
                {app.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                {app.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {app.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                className={`flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${app.gradient} bg-clip-text text-transparent`}
              >
                바로 시작하기
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 text-center">
          <p className="text-2xl mb-2">🚀</p>
          <p className="text-slate-500 text-sm font-semibold">
            더 많은 교육 도구가 곧 추가될 예정입니다
          </p>
          <p className="text-slate-600 text-xs mt-1">
            퀴즈 생성기, 어휘 학습 게임, AI 피드백 등을 준비 중입니다
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 text-center">
        <div className="max-w-5xl mx-auto px-4 text-xs text-slate-600 font-bold space-y-1">
          <p>© {new Date().getFullYear()} 에듀빌더. All rights reserved.</p>
          <p className="text-[10px] text-slate-700">
            선생님과 학생을 위한 세상에서 가장 쉬운 맞춤형 교육용 웹 서비스
          </p>
        </div>
      </footer>
    </div>
  );
}

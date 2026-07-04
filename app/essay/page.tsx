"use client";

import React, { useState } from "react";

interface EssayQuestion {
  number: number;
  question: string;
  points: number;
  time: string;
  hints: string[];
  wordCount: string;
}

interface GeneratedResult {
  questions: EssayQuestion[];
}

const GRADE_OPTIONS = [
  { value: "elementary", label: "초등학교", emoji: "📚" },
  { value: "middle", label: "중학교", emoji: "🎒" },
  { value: "high", label: "고등학교", emoji: "🎓" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "쉬운 (기초)", emoji: "🌱", color: "emerald" },
  { value: "medium", label: "보통 (표준)", emoji: "⚡", color: "amber" },
  { value: "hard", label: "어려운 (심화)", emoji: "🔥", color: "rose" },
];

const COUNT_OPTIONS = [1, 2, 3, 5];

export default function EssayGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("middle");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedHints, setExpandedHints] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedHints(new Set());

    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), grade, difficulty, count }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "서버 오류가 발생했습니다.");
      }
      setResult(data as GeneratedResult);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleHints = (index: number) => {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const copyQuestion = (q: EssayQuestion) => {
    const text = `[논술 문항 ${q.number}] (${q.points}점, ${q.time}, ${q.wordCount})\n\n${q.question}\n\n[채점 기준]\n${q.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(q.number);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.questions
      .map(
        (q) =>
          `[논술 문항 ${q.number}] (${q.points}점, ${q.time}, ${q.wordCount})\n\n${q.question}\n\n[채점 기준]\n${q.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
      )
      .join("\n\n" + "─".repeat(50) + "\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const difficultyColor: Record<string, string> = {
    easy: "emerald",
    medium: "amber",
    hard: "rose",
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Page header */}
      <div className="border-b border-slate-800/60 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-slate-900/60">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-400 border border-violet-500/20 mb-4">
            ✨ AI 논술 문항 생성기
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            주제만 입력하면
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI가 논술 문항을 만들어드립니다
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            OpenAI GPT 기반 논술형 평가 문항 자동 생성 도구입니다. 학교급, 난이도, 문항 수를 선택하고
            주제를 입력하면 교육과정에 맞는 논술 문항과 채점 기준이 즉시 생성됩니다.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Input Form */}
        <form
          onSubmit={handleGenerate}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          {/* Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              📝 논술 주제 입력
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 기후변화와 개인의 책임, 인공지능 발전의 명과 암, 청소년 스마트폰 사용 제한의 필요성..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-600 transition-all resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Grade */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              🏫 학교급
            </label>
            <div className="grid grid-cols-3 gap-3">
              {GRADE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGrade(opt.value)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    grade === opt.value
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-lg shadow-violet-500/10"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xl mb-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              📊 난이도
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    difficulty === opt.value
                      ? opt.color === "emerald"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : opt.color === "amber"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xl mb-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              🔢 생성할 문항 수
            </label>
            <div className="flex gap-3">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                    count === n
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200"
                  }`}
                >
                  {n}개
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-[size:200%_auto] hover:bg-right active:scale-[0.98] shadow-lg shadow-violet-600/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                AI가 문항을 생성 중입니다...
              </span>
            ) : (
              "✨ 논술 문항 생성하기"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-rose-400 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && result.questions && result.questions.length > 0 && (
          <div className="space-y-5">
            {/* Result header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  📋 생성된 논술 문항 ({result.questions.length}개)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  주제: &quot;{topic}&quot; ·{" "}
                  {GRADE_OPTIONS.find((g) => g.value === grade)?.label} ·{" "}
                  {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label}
                </p>
              </div>
              <button
                onClick={copyAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/60 transition-all active:scale-95"
              >
                {copiedIndex === -1 ? "✅ 복사됨!" : "📋 전체 복사"}
              </button>
            </div>

            {result.questions.map((q, idx) => {
              const dc = difficultyColor[difficulty];
              const borderColor =
                dc === "emerald"
                  ? "border-l-emerald-500"
                  : dc === "amber"
                  ? "border-l-amber-500"
                  : "border-l-rose-500";

              return (
                <div
                  key={idx}
                  className={`bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative border-l-4 ${borderColor}`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/20 shrink-0">
                        {q.number}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-400 border border-violet-500/20">
                          {q.points}점
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-600/40">
                          ⏱ {q.time}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-600/40">
                          📝 {q.wordCount}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyQuestion(q)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all active:scale-95"
                    >
                      {copiedIndex === q.number ? "✅" : "📋"}
                    </button>
                  </div>

                  {/* Question text */}
                  <div className="bg-slate-950/80 rounded-2xl p-5 mb-4">
                    <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                      {q.question}
                    </p>
                  </div>

                  {/* Hints toggle */}
                  <button
                    onClick={() => toggleHints(idx)}
                    className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-700/40 transition-all flex items-center justify-center gap-2"
                  >
                    {expandedHints.has(idx) ? "▲ 채점 기준 숨기기" : "▼ 채점 기준 보기"}
                  </button>

                  {/* Hints */}
                  {expandedHints.has(idx) && q.hints && q.hints.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        채점 기준
                      </p>
                      {q.hints.map((hint, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-3 bg-slate-800/40 rounded-xl p-3"
                        >
                          <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {hIdx + 1}
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Re-generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              🔄 다른 문항으로 다시 생성하기
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 text-center mt-8">
        <div className="max-w-5xl mx-auto px-4 text-xs text-slate-600 font-bold space-y-1">
          <p>© {new Date().getFullYear()} 에듀빌더 · AI 논술 문항 생성기</p>
          <p className="text-[10px] text-slate-700">
            Powered by OpenAI GPT-4o-mini · 생성된 문항은 교사가 검토 후 활용하시기 바랍니다
          </p>
        </div>
      </footer>
    </div>
  );
}

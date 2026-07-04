"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { sounds } from "../lib/sounds";

// Problem Type Definition
interface Problem {
  id: number;
  level: number;
  question: string; // E.g., "x² - 5x + 6"
  form: "standard" | "square" | "complex";
  displayForm: string; // E.g., "(x + A)(x + B)"
  // Details for verification
  a: number; // Coefficient of x²
  b: number; // Coefficient of x
  c: number; // Constant
}

interface RankingRecord {
  id?: string;
  nickname: string;
  score: number;
  max_streak: number;
  accuracy: number;
  created_at: string;
}

// Utility to format quadratic expressions nicely (no double signs like x² + -5x)
function formatQuadratic(a: number, b: number, c: number): string {
  let term1 = "";
  if (a === 1) term1 = "x²";
  else if (a === -1) term1 = "-x²";
  else if (a !== 0) term1 = `${a}x²`;

  let term2 = "";
  if (b > 0) {
    term2 = b === 1 ? " + x" : ` + ${b}x`;
  } else if (b < 0) {
    term2 = b === -1 ? " - x" : ` - ${Math.abs(b)}x`;
  }

  let term3 = "";
  if (c > 0) {
    term3 = ` + ${c}`;
  } else if (c < 0) {
    term3 = ` - ${Math.abs(c)}`;
  }

  return `${term1}${term2}${term3}`;
}

// Problem Generator
function generateProblem(level: number): Problem {
  const id = Date.now();
  let type: "standard" | "square" | "complex" = "standard";

  if (level === 1) {
    type = "standard";
  } else if (level === 2) {
    type = "standard";
  } else if (level === 3) {
    type = Math.random() < 0.5 ? "square" : "standard";
  } else {
    // Level 4+
    const rand = Math.random();
    if (rand < 0.45) {
      type = "complex";
    } else if (rand < 0.75) {
      type = "square";
    } else {
      type = "standard";
    }
  }

  if (type === "standard") {
    let a = 0;
    let b = 0;

    if (level === 1) {
      // positive roots (x-a)(x-b) => x² - (a+b)x + ab
      // to make factorization display (x + A)(x + B) easy, we choose integer factors a, b
      // let's pick positive small A, B, so roots are positive.
      a = Math.floor(Math.random() * 5) + 1; // 1 to 5
      b = Math.floor(Math.random() * 5) + 1; // 1 to 5
    } else if (level === 2) {
      // positive/negative factors
      while (a === 0) a = Math.floor(Math.random() * 17) - 8; // -8 to 8
      while (b === 0) b = Math.floor(Math.random() * 17) - 8;
    } else {
      // level 3+ standard includes difference of squares or larger factors
      const isDiffOfSquares = Math.random() < 0.4;
      if (isDiffOfSquares) {
        // x² - k² = (x - k)(x + k)
        const k = Math.floor(Math.random() * 9) + 2; // 2 to 10
        a = k;
        b = -k;
      } else {
        while (a === 0) a = Math.floor(Math.random() * 21) - 10; // -10 to 10
        while (b === 0) b = Math.floor(Math.random() * 21) - 10;
      }
    }

    const coeff_a = 1;
    const coeff_b = a + b;
    const coeff_c = a * b;

    return {
      id,
      level,
      question: formatQuadratic(coeff_a, coeff_b, coeff_c),
      form: "standard",
      displayForm: "(x + A)(x + B)",
      a: coeff_a,
      b: coeff_b,
      c: coeff_c,
    };
  } else if (type === "square") {
    // Perfect square: (x + k)² = x² + 2kx + k²
    let k = 0;
    while (k === 0) k = Math.floor(Math.random() * 13) - 6; // -6 to 6

    const coeff_a = 1;
    const coeff_b = 2 * k;
    const coeff_c = k * k;

    return {
      id,
      level,
      question: formatQuadratic(coeff_a, coeff_b, coeff_c),
      form: "square",
      displayForm: "(x + A)²",
      a: coeff_a,
      b: coeff_b,
      c: coeff_c,
    };
  } else {
    // Complex: (px + q)(rx + s) where p*r > 1
    const p = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const r = Math.floor(Math.random() * 2) + 1; // 1 or 2
    let q = 0;
    let s = 0;
    while (q === 0) q = Math.floor(Math.random() * 9) - 4; // -4 to 4
    while (s === 0) s = Math.floor(Math.random() * 9) - 4; // -4 to 4

    const coeff_a = p * r;
    const coeff_b = p * s + q * r;
    const coeff_c = q * s;

    return {
      id,
      level,
      question: formatQuadratic(coeff_a, coeff_b, coeff_c),
      form: "complex",
      displayForm: "(Px + Q)(Rx + S)",
      a: coeff_a,
      b: coeff_b,
      c: coeff_c,
    };
  }
}

export default function FactorizationGame() {
  // Screen States: 'welcome' | 'playing' | 'gameover' | 'leaderboard'
  const [screen, setScreen] = useState<"welcome" | "playing" | "gameover" | "leaderboard">("welcome");
  
  // Game Play States
  const [nickname, setNickname] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  
  // Statistics
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Inputs
  const [inputs, setInputs] = useState<Record<string, string>>({
    A: "",
    B: "",
    P: "",
    Q: "",
    R: "",
    S: "",
  });

  // UI feedback (correct/wrong animation)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showComboAnimation, setShowComboAnimation] = useState(false);
  const [rankingData, setRankingData] = useState<RankingRecord[]>([]);
  const [localRankingData, setLocalRankingData] = useState<RankingRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardTab, setLeaderboardTab] = useState<"global" | "local">("global");

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Input focus refs for quick navigation
  const inputA_Ref = useRef<HTMLInputElement>(null);
  const inputB_Ref = useRef<HTMLInputElement>(null);
  const inputP_Ref = useRef<HTMLInputElement>(null);
  const inputQ_Ref = useRef<HTMLInputElement>(null);
  const inputR_Ref = useRef<HTMLInputElement>(null);
  const inputS_Ref = useRef<HTMLInputElement>(null);

  // Auto load nickname and local rankings on mount
  useEffect(() => {
    const savedNickname = localStorage.getItem("math_game_nickname");
    if (savedNickname) setNickname(savedNickname);
    
    loadLocalRankings();
    loadGlobalRankings();
  }, []);

  // Fetch rankings from Supabase
  const loadGlobalRankings = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from("math_game_ranking")
        .select("*")
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      setRankingData(data || []);
    } catch (err) {
      console.error("Error loading rankings from Supabase:", err);
    }
  };

  // Fetch local rankings from LocalStorage
  const loadLocalRankings = () => {
    const local = localStorage.getItem("math_game_local_rankings");
    if (local) {
      try {
        const parsed = JSON.parse(local) as RankingRecord[];
        parsed.sort((x, y) => y.score - x.score || new Date(x.created_at).getTime() - new Date(y.created_at).getTime());
        setLocalRankingData(parsed.slice(0, 100));
      } catch (e) {
        console.error("Error parsing local rankings", e);
      }
    }
  };

  // Sound play wrappers
  const playSfx = (type: "correct" | "wrong" | "levelup" | "gameover") => {
    if (!sounds) return;
    if (type === "correct") sounds.playCorrect();
    else if (type === "wrong") sounds.playWrong();
    else if (type === "levelup") sounds.playLevelUp();
    else if (type === "gameover") sounds.playGameOver();
  };

  // Timer tick logic
  useEffect(() => {
    if (screen === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  // Start a new game
  const handleStartGame = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }
    localStorage.setItem("math_game_nickname", nickname.trim());

    // Reset scores & stats
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLevel(1);
    setTimeLeft(60);
    setTotalAttempts(0);
    setCorrectAnswers(0);
    setFeedback(null);
    resetInputs();

    // Generate first problem
    const newProb = generateProblem(1);
    setCurrentProblem(newProb);
    setScreen("playing");

    // Auto focus first input in next tick
    setTimeout(() => {
      focusFirstInput(newProb.form);
    }, 50);
  };

  const resetInputs = () => {
    setInputs({
      A: "",
      B: "",
      P: "",
      Q: "",
      R: "",
      S: "",
    });
  };

  const focusFirstInput = (form: "standard" | "square" | "complex") => {
    if (form === "standard" || form === "square") {
      inputA_Ref.current?.focus();
    } else {
      inputP_Ref.current?.focus();
    }
  };

  // Answer verification/grading logic
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentProblem || feedback !== null) return;

    setTotalAttempts((prev) => prev + 1);
    let isCorrect = false;

    if (currentProblem.form === "standard") {
      const valA = parseInt(inputs.A);
      const valB = parseInt(inputs.B);
      
      if (!isNaN(valA) && !isNaN(valB)) {
        // Standard factors: (x + A)(x + B) = x² + (a+b)x + ab
        // The generator chooses correctFactors (a, b) such that a+b = currentProblem.b and a*b = currentProblem.c
        // Thus standard factors A, B are correct if {A, B} matches {a, b} (commutative)
        const checkSum = valA + valB === currentProblem.b;
        const checkProd = valA * valB === currentProblem.c;
        isCorrect = checkSum && checkProd;
      }
    } else if (currentProblem.form === "square") {
      const valA = parseInt(inputs.A);
      if (!isNaN(valA)) {
        // Perfect Square: (x + A)² = x² + 2kx + k²
        // A must equal currentProblem.b / 2 and A² = currentProblem.c
        const checkSum = 2 * valA === currentProblem.b;
        const checkProd = valA * valA === currentProblem.c;
        isCorrect = checkSum && checkProd;
      }
    } else if (currentProblem.form === "complex") {
      const valP = parseInt(inputs.P);
      const valQ = parseInt(inputs.Q);
      const valR = parseInt(inputs.R);
      const valS = parseInt(inputs.S);

      if (!isNaN(valP) && !isNaN(valQ) && !isNaN(valR) && !isNaN(valS)) {
        // Complex factor: (Px + Q)(Rx + S) = (PR)x² + (PS+QR)x + QS
        const checkA = valP * valR === currentProblem.a;
        const checkC = valQ * valS === currentProblem.c;
        const checkB = valP * valS + valQ * valR === currentProblem.b;
        isCorrect = checkA && checkC && checkB;
      }
    }

    if (isCorrect) {
      // Score calculation: base 100 points + streak bonus + level bonus
      const currentStreak = streak + 1;
      const comboMultiplier = Math.min(1 + Math.floor(currentStreak / 3) * 0.5, 3.0); // caps at 3.0x multiplier
      const points = Math.round(100 * comboMultiplier * (1 + (level - 1) * 0.2));

      setScore((prev) => prev + points);
      setStreak(currentStreak);
      if (currentStreak > maxStreak) setMaxStreak(currentStreak);
      setCorrectAnswers((prev) => prev + 1);
      setFeedback("correct");
      playSfx("correct");

      // Give extra time for correct answers (capped at 99s)
      setTimeLeft((prev) => Math.min(prev + 3, 99));

      // Level-up checking: every 3 correct answers, level up!
      const currentCorrectCount = correctAnswers + 1;
      let nextLevel = level;
      if (currentCorrectCount % 3 === 0) {
        nextLevel = level + 1;
        setLevel(nextLevel);
        playSfx("levelup");
        setShowComboAnimation(true);
        setTimeout(() => setShowComboAnimation(false), 1500);
      }

      // Load next problem after small delay
      setTimeout(() => {
        const nextProb = generateProblem(nextLevel);
        setCurrentProblem(nextProb);
        resetInputs();
        setFeedback(null);
        setTimeout(() => focusFirstInput(nextProb.form), 50);
      }, 800);
    } else {
      // Incorrect answer: reset streak, deduct 5s timer
      setStreak(0);
      setFeedback("wrong");
      playSfx("wrong");
      setTimeLeft((prev) => Math.max(prev - 5, 0));

      // Reset feedback and keep current question so they can try again or check
      setTimeout(() => {
        setFeedback(null);
        resetInputs();
        if (currentProblem) focusFirstInput(currentProblem.form);
      }, 1000);
    }
  };

  // Game over event
  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSfx("gameover");
    setScreen("gameover");
  };

  // Score Submission
  const handleSubmitRanking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    const newRecord: RankingRecord = {
      nickname: nickname.trim(),
      score,
      max_streak: maxStreak,
      accuracy,
      created_at: new Date().toISOString(),
    };

    // 1. Save locally
    const localRankings = localStorage.getItem("math_game_local_rankings");
    const parsed: RankingRecord[] = localRankings ? JSON.parse(localRankings) : [];
    parsed.push(newRecord);
    localStorage.setItem("math_game_local_rankings", JSON.stringify(parsed));
    loadLocalRankings();

    // 2. Save to Supabase (if configured)
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("math_game_ranking").insert([
          {
            nickname: newRecord.nickname,
            score: newRecord.score,
            max_streak: newRecord.max_streak,
            accuracy: newRecord.accuracy,
          },
        ]);
        if (error) throw error;
        await loadGlobalRankings();
      } catch (e) {
        console.error("Supabase insert error:", e);
        alert("데이터베이스 전송에 실패했습니다. 결과가 로컬에만 저장됩니다.");
      }
    }

    setIsSubmitting(false);
    setLeaderboardTab(isSupabaseConfigured ? "global" : "local");
    setScreen("leaderboard");
  };

  // Helper inputs handler
  const handleInputChange = (field: string, value: string) => {
    // Only allow negative signs and numbers
    if (value !== "" && value !== "-" && isNaN(Number(value))) return;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Filter rankings lists based on search
  const filteredGlobalRankings = rankingData.filter((item) =>
    item.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredLocalRankings = localRankingData.filter((item) =>
    item.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* 1. Header & Status Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            onClick={() => setScreen("welcome")}
            className="flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                인수분해 마스터
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Factorization Master</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* DB Connection Badge */}
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                실시간 랭킹 연결됨
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                로컬 단독 연습 모드
              </span>
            )}
            <button
              onClick={() => {
                loadGlobalRankings();
                loadLocalRankings();
                setScreen("leaderboard");
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg transition-all border border-slate-700/60"
            >
              🏆 랭킹 보기
            </button>
          </div>
        </div>
      </header>

      {/* Connection Offline Bar (User Notice) */}
      {!isSupabaseConfigured && (
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-amber-600/30 text-amber-300 text-xs px-4 py-2.5 text-center font-medium">
          💡 Vercel 환경 변수가 감지되지 않아 <strong>오프라인 모드(localStorage)</strong>로 작동 중입니다.
          프로젝트에 <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono mx-1 text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code>와 키를 연결하면 실시간 리더보드가 자동 적용됩니다.
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        
        {/* ==================== WELCOME SCREEN ==================== */}
        {screen === "welcome" && (
          <div className="w-full max-w-md bg-slate-900/65 backdrop-blur-lg border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="text-center space-y-4 mb-8">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                🎯 게임형 수학 학습 플렛폼
              </span>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                인수분해 연습을<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">신나고 빠르게!</span>
              </h2>
              <p className="text-sm text-slate-400">
                제한시간 60초 동안 많은 문제를 풀어 최고 점수를 획득하세요. 콤보를 누적하면 점수가 최대 3배까지 적용됩니다.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  학생 닉네임 입력 (랭킹 표시용)
                </label>
                <input
                  type="text"
                  id="nickname"
                  maxLength={10}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 홍길동, 수학대장"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-all text-center text-lg"
                />
              </div>

              <button
                onClick={handleStartGame}
                disabled={!nickname.trim()}
                className="w-full py-4.5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[size:200%_auto] hover:bg-right active:scale-[0.98] shadow-lg shadow-indigo-600/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-left cursor-pointer"
              >
                🎮 게임 시작하기
              </button>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>🏆 최고 레벨 도전</span>
                <span className="font-semibold text-purple-400">인수분해 공식 완벽 숙지</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PLAYING SCREEN ==================== */}
        {screen === "playing" && currentProblem && (
          <div className="w-full max-w-2xl space-y-6">
            {/* Dashboard Panels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SCORE</p>
                <p className="text-2xl font-black text-white mt-1">{score}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center relative overflow-hidden">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STREAK</p>
                <p className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
                  🔥 {streak}
                </p>
                {streak >= 3 && (
                  <span className="absolute bottom-1 right-0 left-0 text-[9px] text-amber-500 font-bold">
                    {(1 + Math.floor(streak / 3) * 0.5).toFixed(1)}x 배율 적용 중
                  </span>
                )}
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">LEVEL</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">LV.{level}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TIME LEFT</p>
                <p className={`text-2xl font-black mt-1 transition-colors duration-300 ${
                  timeLeft <= 10 ? "text-red-500 animate-pulse" : timeLeft <= 20 ? "text-orange-400" : "text-emerald-400"
                }`}>
                  ⏳ {timeLeft}초
                </p>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-orange-500" : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              ></div>
            </div>

            {/* Problem Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* Level Up Banner Overlay */}
              {showComboAnimation && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-fade-in">
                  <h3 className="text-4xl font-extrabold text-amber-300 animate-bounce">LEVEL UP! 🚀</h3>
                  <p className="text-sm font-semibold text-white mt-1">점점 더 난이도가 높아집니다!</p>
                </div>
              )}

              {/* Feedback Overlay (Correct / Incorrect Glow) */}
              {feedback === "correct" && (
                <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl pointer-events-none animate-pulse"></div>
              )}
              {feedback === "wrong" && (
                <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/40 rounded-3xl pointer-events-none animate-pulse"></div>
              )}

              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                다음 식을 인수분해 하세요
              </p>

              {/* Mathematical Expression display */}
              <div className="text-4xl sm:text-5xl font-black text-white tracking-wide py-6 select-none font-mono">
                {currentProblem.question}
              </div>

              <div className="my-6 border-t border-slate-800/80 my-8"></div>

              {/* Formula & Blanks Input */}
              <form onSubmit={handleSubmitAnswer} className="flex flex-col items-center justify-center gap-6">
                <div className="text-xl sm:text-2xl font-bold text-slate-400 flex flex-wrap items-center justify-center gap-3 font-mono">
                  
                  {/* Standard Form: (x + A)(x + B) */}
                  {currentProblem.form === "standard" && (
                    <>
                      <span>(x +</span>
                      <input
                        ref={inputA_Ref}
                        type="text"
                        value={inputs.A}
                        onChange={(e) => handleInputChange("A", e.target.value)}
                        placeholder="A"
                        className="w-16 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xl font-bold font-mono transition-all"
                      />
                      <span>)(x +</span>
                      <input
                        ref={inputB_Ref}
                        type="text"
                        value={inputs.B}
                        onChange={(e) => handleInputChange("B", e.target.value)}
                        placeholder="B"
                        className="w-16 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xl font-bold font-mono transition-all"
                      />
                      <span>)</span>
                    </>
                  )}

                  {/* Perfect Square Form: (x + A)² */}
                  {currentProblem.form === "square" && (
                    <>
                      <span>(x +</span>
                      <input
                        ref={inputA_Ref}
                        type="text"
                        value={inputs.A}
                        onChange={(e) => handleInputChange("A", e.target.value)}
                        placeholder="A"
                        className="w-16 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xl font-bold font-mono transition-all"
                      />
                      <span>)²</span>
                    </>
                  )}

                  {/* Complex Form: (Px + Q)(Rx + S) */}
                  {currentProblem.form === "complex" && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span>(</span>
                      <input
                        ref={inputP_Ref}
                        type="text"
                        value={inputs.P}
                        onChange={(e) => handleInputChange("P", e.target.value)}
                        placeholder="P"
                        className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold font-mono transition-all"
                      />
                      <span>x +</span>
                      <input
                        ref={inputQ_Ref}
                        type="text"
                        value={inputs.Q}
                        onChange={(e) => handleInputChange("Q", e.target.value)}
                        placeholder="Q"
                        className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold font-mono transition-all"
                      />
                      <span>)(</span>
                      <input
                        ref={inputR_Ref}
                        type="text"
                        value={inputs.R}
                        onChange={(e) => handleInputChange("R", e.target.value)}
                        placeholder="R"
                        className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold font-mono transition-all"
                      />
                      <span>x +</span>
                      <input
                        ref={inputS_Ref}
                        type="text"
                        value={inputs.S}
                        onChange={(e) => handleInputChange("S", e.target.value)}
                        placeholder="S"
                        className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold font-mono transition-all"
                      />
                      <span>)</span>
                    </div>
                  )}

                </div>

                <div className="w-full flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetInputs();
                      focusFirstInput(currentProblem.form);
                    }}
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700/60 transition-all cursor-pointer"
                  >
                    🔄 지우기
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    제출하기 (Enter)
                  </button>
                </div>
              </form>

              {/* Instructions Helper */}
              <div className="mt-8 text-xs text-slate-500 font-semibold space-y-1">
                <p>💡 팁: 음수는 마이너스 기호를 함께 입력하세요 (예: -2)</p>
                {currentProblem.form === "complex" && <p>💡 팁: x의 계수가 1인 경우 P 또는 R에 1을 입력하세요.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ==================== GAME OVER SCREEN ==================== */}
        {screen === "gameover" && (
          <div className="w-full max-w-md bg-slate-900/65 backdrop-blur-lg border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>

            <div className="text-center space-y-2 mb-8">
              <span className="text-4xl">⏱️</span>
              <h2 className="text-3xl font-extrabold text-white leading-tight">시간이 종료되었습니다!</h2>
              <p className="text-sm text-slate-400">수고하셨습니다. 점수를 랭킹에 등록해보세요.</p>
            </div>

            {/* Score details card */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 space-y-4 mb-8">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                <span className="text-sm text-slate-400 font-semibold">플레이어 닉네임</span>
                <span className="font-bold text-white text-lg">{nickname}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                <span className="text-sm text-slate-400 font-semibold">최종 획득 점수</span>
                <span className="font-extrabold text-indigo-400 text-2xl">{score}점</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">최대 콤보</p>
                  <p className="text-lg font-black text-amber-400 mt-0.5">🔥 {maxStreak}</p>
                </div>
                <div className="text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">맞춘 문제</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{correctAnswers}개</p>
                </div>
                <div className="text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">정답률</p>
                  <p className="text-lg font-black text-purple-400 mt-0.5">
                    {totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSubmitRanking}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "등록 중..." : "🏆 내 기록 랭킹에 등록하기"}
              </button>

              <button
                onClick={handleStartGame}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/60 active:scale-[0.98] transition-all cursor-pointer"
              >
                🎮 다시 도전하기
              </button>
            </div>
          </div>
        )}

        {/* ==================== LEADERBOARD SCREEN ==================== */}
        {screen === "leaderboard" && (
          <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  🏆 명예의 전당
                </h2>
                <p className="text-xs text-slate-400 mt-1">인수분해 연습게임에서 최고의 성적을 거둔 실시간 랭킹</p>
              </div>

              {/* Tab selector for global / local */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                {isSupabaseConfigured && (
                  <button
                    onClick={() => setLeaderboardTab("global")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      leaderboardTab === "global" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    지구 전체 랭킹
                  </button>
                )}
                <button
                  onClick={() => setLeaderboardTab("local")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    leaderboardTab === "local" || !isSupabaseConfigured ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  내 로컬 기록
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="학생 닉네임 검색..."
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-y-auto max-h-[350px] pr-2 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-16 text-center">순위</th>
                    <th className="py-3 px-4">닉네임</th>
                    <th className="py-3 px-4 text-center">최대 콤보</th>
                    <th className="py-3 px-4 text-center">정답률</th>
                    <th className="py-3 px-4 text-right">점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {/* Choose which rankings list to display */}
                  {(leaderboardTab === "global" ? filteredGlobalRankings : filteredLocalRankings).length > 0 ? (
                    (leaderboardTab === "global" ? filteredGlobalRankings : filteredLocalRankings).map((record, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;
                      const isSelf = record.nickname.toLowerCase() === nickname.toLowerCase();
                      
                      return (
                        <tr
                          key={record.id || index}
                          className={`hover:bg-slate-800/30 transition-colors ${
                            isSelf ? "bg-indigo-600/10 font-bold border-l-2 border-l-indigo-500" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-bold">
                            {rank === 1 ? (
                              <span className="text-xl">🥇</span>
                            ) : rank === 2 ? (
                              <span className="text-xl">🥈</span>
                            ) : rank === 3 ? (
                              <span className="text-xl">🥉</span>
                            ) : (
                              <span className="text-slate-400 font-mono text-sm">{rank}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-200 text-sm block max-w-[150px] truncate">
                              {record.nickname}
                              {isSelf && <span className="ml-1.5 text-[9px] bg-indigo-500/20 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30">나</span>}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-amber-500 font-semibold font-mono text-sm">
                            🔥 {record.max_streak}
                          </td>
                          <td className="py-3.5 px-4 text-center text-purple-400 font-semibold font-mono text-sm">
                            {record.accuracy}%
                          </td>
                          <td className="py-3.5 px-4 text-right text-indigo-400 font-black font-mono text-sm">
                            {record.score}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-semibold text-sm">
                        {searchQuery ? "검색 결과에 맞는 랭킹이 없습니다." : "아직 기록이 존재하지 않습니다!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setScreen("welcome")}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700/60 transition-all cursor-pointer"
              >
                🏠 홈으로 돌아가기
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                🎮 새로 도전하기
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 transition-all duration-300 text-center">
        <div className="max-w-5xl mx-auto px-4 text-xs text-slate-600 font-bold space-y-1">
          <p>© {new Date().getFullYear()} 인수분해 마스터. All rights reserved.</p>
          <p className="text-[10px] text-slate-700">Created for Math Students with Supabase and Vercel Integrations</p>
        </div>
      </footer>
    </div>
  );
}

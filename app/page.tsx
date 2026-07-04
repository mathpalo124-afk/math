"use client";

import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      
      {/* 1. 상단 헤더 (Header) */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* 서비스 로고 (텍스트) */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              🎓 에듀빌더 (EduBuilder)
            </span>
          </div>

          {/* 네비게이션 바 공간 (선생님들이 원할 때 메뉴를 추가할 수 있는 공간입니다) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">홈</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">소개</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">가이드</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">커뮤니티</a>
          </nav>

          {/* 모바일 화면용 간단 뱃지 (확장 가능) */}
          <div className="flex md:hidden">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/20">
              선생님 전용 템플릿
            </span>
          </div>

        </div>
      </header>

      {/* 2. 메인 화면 (Hero Section) */}
      <main className="flex-1 flex items-center justify-center py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          
          {/* 배너 태그 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-300">
            🚀 코딩 초보자도 바로 시작하는 Next.js
          </div>

          {/* 메인 환영 문구 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            나만의 <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">교육용 웹앱</span> 만들기
          </h1>

          {/* 간단 설명 */}
          <p className="max-w-xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            이 프로젝트는 Vercel을 통해 클릭 한 번으로 배포할 수 있는 초간단 템플릿입니다. 
            원하는 수업 자료, 퀴즈, 타이머 등 다양한 학습 지원 기능들을 이곳에 추가해 보세요!
          </p>

          {/* 기능 추가를 위한 가짜(Placeholder) 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => alert("🎉 첫 번째 교육 도구 기능을 여기에 추가해 보세요!")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              여기를 눌러 기능 시작하기 (Placeholder)
            </button>
            <a 
              href="https://nextjs.org/docs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold text-zinc-600 border border-zinc-300 bg-white hover:bg-zinc-50 dark:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all duration-200 text-center"
            >
              Next.js 공식 문서 보기
            </a>
          </div>

          {/* 코딩 멘토의 팁 (선생님들을 위한 가이드라인 영역) */}
          <div className="mt-16 p-6 rounded-2xl border border-zinc-200/60 bg-white/50 text-left shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
            <h3 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              💡 친절한 코딩 멘토의 팁
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>새로운 페이지를 추가하고 싶다면 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">app/</code> 폴더 아래에 새 폴더를 만들고 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">page.tsx</code>를 추가해 보세요.</li>
              <li>화면 디자인은 Tailwind CSS의 클래스(예: <code className="font-mono text-zinc-500">text-center</code>, <code className="font-mono text-zinc-500">bg-blue-500</code> 등)를 사용해 자유롭게 바꿀 수 있습니다.</li>
              <li>버튼 클릭(<code className="font-mono">onClick</code>)이나 상태 관리(<code className="font-mono">useState</code>) 등 동적인 기능이 필요한 파일의 맨 위에는 반드시 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">"use client";</code> 지시어를 선언해야 빌드 에러가 나지 않습니다.</li>
              <li>작성이 완료되면 터미널에 변경 사항을 커밋하고 푸시하면 Vercel이 즉시 새 버전으로 업데이트해 줍니다.</li>
            </ul>
          </div>

        </div>
      </main>

      {/* 3. 하단 푸터 (Footer) */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} 에듀빌더. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-center sm:text-right">
            <span>Made with ❤️ for amazing Teachers & Students</span>
          </p>
        </div>
      </footer>

    </div>
  );
}


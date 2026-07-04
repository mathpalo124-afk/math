import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const body = await request.json();
    const { topic, grade, difficulty, count } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "주제를 입력해주세요." },
        { status: 400 }
      );
    }

    const gradeLabel =
      grade === "middle"
        ? "중학교"
        : grade === "high"
        ? "고등학교"
        : "초등학교";

    const difficultyLabel =
      difficulty === "easy"
        ? "쉬운 (기초)"
        : difficulty === "hard"
        ? "어려운 (심화)"
        : "보통 (표준)";

    const systemPrompt = `당신은 대한민국 교육과정에 맞춘 전문 논술형 평가 문항 출제 전문가입니다.
교사가 제공한 주제를 바탕으로 논술형 평가 문항을 작성합니다.
문항은 명확하고 학생이 충분히 생각하고 글을 쓸 수 있도록 구체적이어야 합니다.
문항은 학생의 비판적 사고, 창의력, 논리적 표현 능력을 평가할 수 있어야 합니다.`;

    const userPrompt = `다음 조건에 맞는 논술형 평가 문항 ${count}개를 작성해주세요:

- 주제: ${topic}
- 대상: ${gradeLabel} 학생
- 난이도: ${difficultyLabel}

출력 형식 (반드시 JSON으로 응답하세요):
{
  "questions": [
    {
      "number": 1,
      "question": "문항 내용",
      "points": 배점(숫자),
      "time": "권장 작성 시간(예: 20분)",
      "hints": ["채점 기준 1", "채점 기준 2", "채점 기준 3"],
      "wordCount": "권장 분량(예: 300자 이내)"
    }
  ]
}

JSON 외에 다른 텍스트를 포함하지 마세요.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI 응답이 비어있습니다.");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Essay generation error:", error);
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

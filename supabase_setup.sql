-- 1. Create the ranking table
CREATE TABLE IF NOT EXISTS public.math_game_ranking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    max_streak INTEGER DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for fast leaderboard queries (ordered by score high-to-low, then oldest-to-newest for ties)
CREATE INDEX IF NOT EXISTS idx_math_game_ranking_score 
ON public.math_game_ranking (score DESC, created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.math_game_ranking ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone to read the leaderboard (Select)
CREATE POLICY "Allow public read access" 
ON public.math_game_ranking 
FOR SELECT 
USING (true);

-- Allow anyone to submit their scores (Insert)
CREATE POLICY "Allow public insert access" 
ON public.math_game_ranking 
FOR INSERT 
WITH CHECK (true);

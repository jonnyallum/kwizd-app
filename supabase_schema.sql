-- 1. Create Quizzes Table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'multiple_choice',
  options JSONB, -- stores [ "Choice A", "Choice B", ... ]
  answer TEXT NOT NULL,
  fact TEXT,
  difficulty TEXT,
  question_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create active Games (Sessions)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id),
  pin TEXT UNIQUE NOT NULL, -- 4 digit PIN
  status TEXT DEFAULT 'lobby', -- lobby, active, finished
  current_question_id UUID REFERENCES questions(id),
  host_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Players Table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  buzzer_sound TEXT DEFAULT 'default',
  score INT DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, team_name)
);

-- 5. Create Responses (Buzzer & Answers)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answer TEXT,
  is_correct BOOLEAN,
  speed_ms INT, -- precise latency for the "Speed" part of SpeedQuizzing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE REALTIME for these tables
-- Run these individually in the SQL Editor
-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE responses;

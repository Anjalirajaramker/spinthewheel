-- Optional manual schema setup for Postgres
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  assigned_question_ids JSONB NOT NULL,
  current_clue INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  start_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  elapsed_seconds INTEGER,
  hints_used INTEGER NOT NULL DEFAULT 0,
  penalty_seconds INTEGER NOT NULL DEFAULT 0,
  final_code TEXT
);

CREATE TABLE IF NOT EXISTS attempts (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  clue_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_usage (
  question_id TEXT PRIMARY KEY,
  usage_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  task TEXT NOT NULL,
  clue TEXT NOT NULL,
  link TEXT,
  hint TEXT NOT NULL,
  answers JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

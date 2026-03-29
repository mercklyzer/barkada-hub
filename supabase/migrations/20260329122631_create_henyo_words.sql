CREATE TABLE IF NOT EXISTS henyo_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'tao', 'bagay', 'lugar', 'hayop',
                'pagkain', 'pelikula', 'kanta', 'palaro'
              )),
  difficulty  TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language    TEXT NOT NULL DEFAULT 'filipino' CHECK (language IN ('filipino', 'english', 'mixed')),
  hint        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_henyo_words_category ON henyo_words (category);
CREATE INDEX IF NOT EXISTS idx_henyo_words_language ON henyo_words (language);
CREATE INDEX IF NOT EXISTS idx_henyo_words_active   ON henyo_words (is_active);

-- RLS
ALTER TABLE henyo_words ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'henyo_words' AND policyname = 'Allow public read of active words'
  ) THEN
    CREATE POLICY "Allow public read of active words"
      ON henyo_words FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

TRUNCATE henyo_words RESTART IDENTITY CASCADE;

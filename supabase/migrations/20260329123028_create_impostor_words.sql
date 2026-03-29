CREATE TABLE IF NOT EXISTS impostor_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT NOT NULL,
  category    TEXT NOT NULL,
  difficulty  TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language    TEXT NOT NULL DEFAULT 'filipino' CHECK (language IN ('filipino', 'english', 'mixed')),
  hint        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impostor_words_category ON impostor_words (category);
CREATE INDEX IF NOT EXISTS idx_impostor_words_language ON impostor_words (language);
CREATE INDEX IF NOT EXISTS idx_impostor_words_active   ON impostor_words (is_active);

ALTER TABLE impostor_words ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'impostor_words' AND policyname = 'Allow public read of active impostor words'
  ) THEN
    CREATE POLICY "Allow public read of active impostor words"
      ON impostor_words FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

TRUNCATE impostor_words RESTART IDENTITY CASCADE;

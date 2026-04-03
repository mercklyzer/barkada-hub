CREATE TABLE IF NOT EXISTS werewolf_day_votes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID        NOT NULL REFERENCES werewolf_rooms(id) ON DELETE CASCADE,
  round_number INTEGER     NOT NULL,
  voter_id     TEXT        NOT NULL,
  target_id    TEXT        NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE werewolf_day_votes ADD CONSTRAINT uq_werewolf_day_vote_per_round
  UNIQUE (room_id, round_number, voter_id);

CREATE INDEX IF NOT EXISTS idx_werewolf_day_votes_room_round
  ON werewolf_day_votes (room_id, round_number);

ALTER TABLE werewolf_day_votes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'werewolf_day_votes' AND policyname = 'Allow public read of werewolf day votes'
  ) THEN
    CREATE POLICY "Allow public read of werewolf day votes"
      ON werewolf_day_votes FOR SELECT
      USING (true);
  END IF;
END
$$;

-- NOT added to replication publication

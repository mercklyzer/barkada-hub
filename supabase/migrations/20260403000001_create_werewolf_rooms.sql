CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS werewolf_rooms (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code            TEXT        NOT NULL UNIQUE,
  host_id              TEXT        NOT NULL,
  phase                TEXT        NOT NULL DEFAULT 'lobby'
                         CHECK (phase IN ('lobby','role_reveal','night','night_resolving',
                                          'day_announcement','discussion','day_vote',
                                          'elimination','game_over')),
  round_number         INTEGER     NOT NULL DEFAULT 1,
  night_kill_target_id TEXT,
  night_saved          BOOLEAN     NOT NULL DEFAULT false,
  eliminated_player_id TEXT,
  winner               TEXT        CHECK (winner IN ('village','werewolves')),
  settings             JSONB       NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_werewolf_rooms_code ON werewolf_rooms (room_code);

CREATE OR REPLACE TRIGGER trg_werewolf_rooms_updated_at
  BEFORE UPDATE ON werewolf_rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE werewolf_rooms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'werewolf_rooms' AND policyname = 'Allow public read of werewolf rooms'
  ) THEN
    CREATE POLICY "Allow public read of werewolf rooms"
      ON werewolf_rooms FOR SELECT
      USING (true);
  END IF;
END
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE werewolf_rooms;

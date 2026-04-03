CREATE TABLE IF NOT EXISTS werewolf_night_actions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID        NOT NULL REFERENCES werewolf_rooms(id) ON DELETE CASCADE,
  round_number INTEGER     NOT NULL,
  actor_id     TEXT        NOT NULL,
  action_type  TEXT        NOT NULL CHECK (action_type IN ('wolf_kill','seer_peek','doctor_protect')),
  target_id    TEXT        NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE werewolf_night_actions ADD CONSTRAINT uq_werewolf_night_action_per_round
  UNIQUE (room_id, round_number, actor_id);

CREATE INDEX IF NOT EXISTS idx_werewolf_night_actions_room_round
  ON werewolf_night_actions (room_id, round_number);

ALTER TABLE werewolf_night_actions ENABLE ROW LEVEL SECURITY;

-- No SELECT policy — anon cannot read night actions; service role bypasses RLS
-- NOT added to replication publication

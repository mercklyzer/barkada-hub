CREATE TABLE server_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
  message TEXT NOT NULL,
  route TEXT,
  method TEXT,
  status_code INT,
  error_code TEXT,
  error_details JSONB,
  stack_trace TEXT,
  metadata JSONB
);

CREATE INDEX idx_server_logs_created_at ON server_logs (created_at DESC);
CREATE INDEX idx_server_logs_level ON server_logs (level);
CREATE INDEX idx_server_logs_route ON server_logs (route);

-- Restrict to service role only — no public or anon access
ALTER TABLE server_logs ENABLE ROW LEVEL SECURITY;

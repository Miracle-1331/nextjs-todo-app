-- Idempotent schema init — safe to run multiple times
CREATE TABLE IF NOT EXISTS todos (
  id         SERIAL       PRIMARY KEY,
  title      TEXT         NOT NULL,
  completed  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos (completed);

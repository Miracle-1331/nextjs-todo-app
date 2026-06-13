-- V1: initial schema
CREATE TABLE todos (
  id         SERIAL       PRIMARY KEY,
  title      TEXT         NOT NULL,
  completed  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todos_completed ON todos (completed);

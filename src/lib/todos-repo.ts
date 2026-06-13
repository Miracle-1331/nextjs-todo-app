import type { Todo } from "./store";
import { query } from "./db";

interface DbRow {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
}

function toTodo(row: DbRow): Todo {
  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  };
}

export async function dbGetAllTodos(): Promise<Todo[]> {
  const rows = await query<DbRow>("SELECT * FROM todos ORDER BY id ASC");
  return rows.map(toTodo);
}

export async function dbGetTodoById(id: string): Promise<Todo | undefined> {
  const rows = await query<DbRow>("SELECT * FROM todos WHERE id = $1", [id]);
  return rows[0] ? toTodo(rows[0]) : undefined;
}

export async function dbCreateTodo(title: string): Promise<Todo> {
  const rows = await query<DbRow>(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *",
    [title]
  );
  return toTodo(rows[0]);
}

export async function dbUpdateTodo(
  id: string,
  patch: Partial<Pick<Todo, "title" | "completed">>
): Promise<Todo | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (patch.title !== undefined) { fields.push(`title = $${i++}`); values.push(patch.title); }
  if (patch.completed !== undefined) { fields.push(`completed = $${i++}`); values.push(patch.completed); }
  if (!fields.length) return (await dbGetTodoById(id)) ?? null;

  values.push(id);
  const rows = await query<DbRow>(
    `UPDATE todos SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows[0] ? toTodo(rows[0]) : null;
}

export async function dbDeleteTodo(id: string): Promise<boolean> {
  const rows = await query<{ id: number }>(
    "DELETE FROM todos WHERE id = $1 RETURNING id",
    [id]
  );
  return rows.length > 0;
}

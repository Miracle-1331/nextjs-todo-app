import { NextRequest, NextResponse } from "next/server";
import { getTodoById, updateTodo, deleteTodo } from "@/lib/store";
import { dbGetTodoById, dbUpdateTodo, dbDeleteTodo } from "@/lib/todos-repo";

type Params = { params: Promise<{ id: string }> };

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const todo = dbEnabled() ? await dbGetTodoById(id) : getTodoById(id);
  if (!todo) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(todo);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch = {
    ...(body.title !== undefined && { title: String(body.title).trim() }),
    ...(body.completed !== undefined && { completed: Boolean(body.completed) }),
  };
  const todo = dbEnabled() ? await dbUpdateTodo(id, patch) : updateTodo(id, patch);
  if (!todo) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(todo);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const deleted = dbEnabled() ? await dbDeleteTodo(id) : deleteTodo(id);
  if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

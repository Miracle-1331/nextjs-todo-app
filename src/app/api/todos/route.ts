import { NextRequest, NextResponse } from "next/server";
import { getAllTodos, createTodo } from "@/lib/store";
import { dbGetAllTodos, dbCreateTodo } from "@/lib/todos-repo";

const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export async function GET() {
  const todos = dbEnabled() ? await dbGetAllTodos() : getAllTodos();
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const todo = dbEnabled() ? await dbCreateTodo(title) : createTodo(title);
  return NextResponse.json(todo, { status: 201 });
}

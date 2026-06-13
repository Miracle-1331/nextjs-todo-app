/**
 * Unit tests for the todos API routes.
 * DATABASE_URL is unset so all routes use the in-memory store.
 */
import { NextRequest } from "next/server";
import { GET as listTodos, POST as createTodoRoute } from "@/app/api/todos/route";
import { GET as getTodo, PATCH as patchTodo, DELETE as deleteTodoRoute } from "@/app/api/todos/[id]/route";
import { resetStore } from "@/lib/store";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest("http://localhost/api/todos", {
    method,
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
}

beforeEach(() => {
  delete process.env.DATABASE_URL;
  resetStore();
});

describe("GET /api/todos", () => {
  it("returns empty array initially", async () => {
    const res = await listTodos();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns created todos", async () => {
    await createTodoRoute(makeRequest("POST", { title: "test" }));
    const res = await listTodos();
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("test");
  });
});

describe("POST /api/todos", () => {
  it("creates a todo and returns 201", async () => {
    const res = await createTodoRoute(makeRequest("POST", { title: "hello" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ id: "1", title: "hello", completed: false });
  });

  it("returns 400 when title is missing", async () => {
    const res = await createTodoRoute(makeRequest("POST", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when title is blank", async () => {
    const res = await createTodoRoute(makeRequest("POST", { title: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not JSON", async () => {
    const req = new NextRequest("http://localhost/api/todos", {
      method: "POST",
      body: "not-json",
    });
    const res = await createTodoRoute(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/todos/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await getTodo(makeRequest("GET"), makeParams("999"));
    expect(res.status).toBe(404);
  });

  it("returns the todo for a valid id", async () => {
    await createTodoRoute(makeRequest("POST", { title: "find me" }));
    const res = await getTodo(makeRequest("GET"), makeParams("1"));
    expect(res.status).toBe(200);
    expect((await res.json()).title).toBe("find me");
  });
});

describe("PATCH /api/todos/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await patchTodo(makeRequest("PATCH", { completed: true }), makeParams("999"));
    expect(res.status).toBe(404);
  });

  it("updates completed", async () => {
    await createTodoRoute(makeRequest("POST", { title: "patch me" }));
    const res = await patchTodo(makeRequest("PATCH", { completed: true }), makeParams("1"));
    expect(res.status).toBe(200);
    expect((await res.json()).completed).toBe(true);
  });

  it("updates title", async () => {
    await createTodoRoute(makeRequest("POST", { title: "old" }));
    const res = await patchTodo(makeRequest("PATCH", { title: "new" }), makeParams("1"));
    expect((await res.json()).title).toBe("new");
  });
});

describe("DELETE /api/todos/:id", () => {
  it("returns 404 for unknown id", async () => {
    const res = await deleteTodoRoute(makeRequest("DELETE"), makeParams("999"));
    expect(res.status).toBe(404);
  });

  it("deletes and returns 204", async () => {
    await createTodoRoute(makeRequest("POST", { title: "bye" }));
    const res = await deleteTodoRoute(makeRequest("DELETE"), makeParams("1"));
    expect(res.status).toBe(204);
    const list = await (await listTodos()).json();
    expect(list).toHaveLength(0);
  });
});

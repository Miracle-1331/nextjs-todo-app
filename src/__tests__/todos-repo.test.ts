/**
 * Unit tests for the Postgres repository layer.
 * The pg Pool is mocked — no real database connection required.
 */
import type { Todo } from "@/lib/store";

const mockQuery = jest.fn();

jest.mock("../lib/db", () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import {
  dbGetAllTodos,
  dbGetTodoById,
  dbCreateTodo,
  dbUpdateTodo,
  dbDeleteTodo,
} from "@/lib/todos-repo";

function makeRow(overrides: Partial<{
  id: number; title: string; completed: boolean; created_at: Date;
}> = {}) {
  return {
    id: 1,
    title: "Test todo",
    completed: false,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => mockQuery.mockReset());

describe("dbGetAllTodos", () => {
  it("returns mapped todos", async () => {
    mockQuery.mockResolvedValue([makeRow({ id: 1, title: "a" }), makeRow({ id: 2, title: "b" })]);
    const todos = await dbGetAllTodos();
    expect(todos).toHaveLength(2);
    expect(todos[0]).toMatchObject<Partial<Todo>>({ id: "1", title: "a", completed: false });
    expect(todos[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("returns empty array when no rows", async () => {
    mockQuery.mockResolvedValue([]);
    expect(await dbGetAllTodos()).toEqual([]);
  });
});

describe("dbGetTodoById", () => {
  it("returns todo when found", async () => {
    mockQuery.mockResolvedValue([makeRow({ id: 5, title: "hello" })]);
    const todo = await dbGetTodoById("5");
    expect(todo).toMatchObject({ id: "5", title: "hello" });
  });

  it("returns undefined when not found", async () => {
    mockQuery.mockResolvedValue([]);
    expect(await dbGetTodoById("999")).toBeUndefined();
  });
});

describe("dbCreateTodo", () => {
  it("inserts and returns the new todo", async () => {
    mockQuery.mockResolvedValue([makeRow({ id: 3, title: "new todo" })]);
    const todo = await dbCreateTodo("new todo");
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO todos"),
      ["new todo"]
    );
    expect(todo).toMatchObject({ id: "3", title: "new todo", completed: false });
  });
});

describe("dbUpdateTodo", () => {
  it("updates and returns the todo", async () => {
    mockQuery.mockResolvedValue([makeRow({ id: 1, title: "updated", completed: true })]);
    const todo = await dbUpdateTodo("1", { title: "updated", completed: true });
    expect(todo).toMatchObject({ title: "updated", completed: true });
  });

  it("returns null when not found", async () => {
    mockQuery.mockResolvedValue([]);
    expect(await dbUpdateTodo("999", { completed: true })).toBeNull();
  });

  it("only updates provided fields", async () => {
    mockQuery.mockResolvedValue([makeRow({ completed: true })]);
    await dbUpdateTodo("1", { completed: true });
    const sql: string = mockQuery.mock.calls[0][0];
    expect(sql).toContain("completed");
    expect(sql).not.toContain("title");
  });
});

describe("dbDeleteTodo", () => {
  it("returns true when row deleted", async () => {
    mockQuery.mockResolvedValue([{ id: 1 }]);
    expect(await dbDeleteTodo("1")).toBe(true);
  });

  it("returns false when not found", async () => {
    mockQuery.mockResolvedValue([]);
    expect(await dbDeleteTodo("999")).toBe(false);
  });
});

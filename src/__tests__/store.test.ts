import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  resetStore,
  updateTodo,
} from "@/lib/store";

beforeEach(() => resetStore());

describe("createTodo", () => {
  it("returns a todo with incremental id and defaults", () => {
    const todo = createTodo("Buy milk");
    expect(todo).toMatchObject({ id: "1", title: "Buy milk", completed: false });
    expect(todo.createdAt).toBeDefined();
  });

  it("increments ids across multiple todos", () => {
    expect(createTodo("a").id).toBe("1");
    expect(createTodo("b").id).toBe("2");
  });
});

describe("getAllTodos", () => {
  it("returns empty array on fresh store", () => {
    expect(getAllTodos()).toEqual([]);
  });

  it("returns all created todos", () => {
    createTodo("x");
    createTodo("y");
    expect(getAllTodos()).toHaveLength(2);
  });
});

describe("getTodoById", () => {
  it("returns undefined for missing id", () => {
    expect(getTodoById("999")).toBeUndefined();
  });

  it("returns the correct todo", () => {
    const todo = createTodo("hello");
    expect(getTodoById(todo.id)).toEqual(todo);
  });
});

describe("updateTodo", () => {
  it("returns null for missing id", () => {
    expect(updateTodo("999", { completed: true })).toBeNull();
  });

  it("patches title and completed", () => {
    const todo = createTodo("old");
    const updated = updateTodo(todo.id, { title: "new", completed: true });
    expect(updated).toMatchObject({ title: "new", completed: true });
  });

  it("does not overwrite unpatched fields", () => {
    const todo = createTodo("keep");
    const updated = updateTodo(todo.id, { completed: true });
    expect(updated?.title).toBe("keep");
  });
});

describe("deleteTodo", () => {
  it("returns false for missing id", () => {
    expect(deleteTodo("999")).toBe(false);
  });

  it("removes the todo and returns true", () => {
    const todo = createTodo("remove me");
    expect(deleteTodo(todo.id)).toBe(true);
    expect(getTodoById(todo.id)).toBeUndefined();
    expect(getAllTodos()).toHaveLength(0);
  });
});

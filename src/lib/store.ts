export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// In-memory store — used when DATABASE_URL is not set (dev/test fallback)
const todos = new Map<string, Todo>();
let counter = 1;

export function getAllTodos(): Todo[] {
  return Array.from(todos.values());
}

export function getTodoById(id: string): Todo | undefined {
  return todos.get(id);
}

export function createTodo(title: string): Todo {
  const id = String(counter++);
  const todo: Todo = { id, title, completed: false, createdAt: new Date().toISOString() };
  todos.set(id, todo);
  return todo;
}

export function updateTodo(id: string, patch: Partial<Pick<Todo, "title" | "completed">>): Todo | null {
  const todo = todos.get(id);
  if (!todo) return null;
  const updated = { ...todo, ...patch };
  todos.set(id, updated);
  return updated;
}

export function deleteTodo(id: string): boolean {
  return todos.delete(id);
}

export function resetStore(): void {
  todos.clear();
  counter = 1;
}

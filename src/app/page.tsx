"use client";

import { useEffect, useRef, useState } from "react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

type Filter = "all" | "active" | "completed";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/todos")
      .then((r) => r.json())
      .then(setTodos)
      .catch(() => setError("Failed to load todos"));
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const todo: Todo = await res.json();
      setTodos((prev) => [...prev, todo]);
      setInput("");
      inputRef.current?.focus();
    } catch {
      setError("Failed to add todo");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    }
  }

  async function deleteTodo(id: string) {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  async function clearCompleted() {
    const completed = todos.filter((t) => t.completed);
    await Promise.all(completed.map((t) => deleteTodo(t.id)));
  }

  const visible = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <main>
      <h1>Todo App</h1>

      <form className="add-form" onSubmit={addTodo}>
        <input
          ref={inputRef}
          data-testid="todo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          disabled={loading}
          aria-label="New todo title"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          data-testid="add-btn"
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </form>

      {error && <p className="error-msg" data-testid="error-msg">{error}</p>}

      {todos.length > 0 && (
        <div className="filters">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="empty" data-testid="empty-message">
          {todos.length === 0 ? "No todos yet — add one above!" : "Nothing here."}
        </p>
      ) : (
        <ul className="todo-list" data-testid="todo-list">
          {visible.map((todo) => (
            <li key={todo.id} className="todo-item" data-testid="todo-item">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                data-testid="todo-checkbox"
              />
              <span className={`todo-title${todo.completed ? " done" : ""}`} data-testid="todo-title">
                {todo.title}
              </span>
              <span className="todo-meta">{formatDate(todo.createdAt)}</span>
              <button
                className="btn btn-danger"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete "${todo.title}"`}
                data-testid="delete-btn"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <div className="summary">
          <span data-testid="active-count">{activeCount} item{activeCount !== 1 ? "s" : ""} left</span>
          {completedCount > 0 && (
            <button className="btn btn-danger" onClick={clearCompleted} data-testid="clear-completed">
              Clear completed ({completedCount})
            </button>
          )}
        </div>
      )}
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  deletedAt?: number;
};

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [trash, setTrash] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    const savedTodos = localStorage.getItem("bpds_todos");
    const savedTrash = localStorage.getItem("bpds_trash");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error("Error cargando localStorage (todos)", e);
      }
    }
    if (savedTrash) {
      try {
        setTrash(JSON.parse(savedTrash));
      } catch (e) {
        console.error("Error cargando localStorage (trash)", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bpds_todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bpds_trash", JSON.stringify(trash));
    }
  }, [trash, isLoaded]);

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTodo.trim() !== "") {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
      };

      setTodos([todo, ...todos]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const updateTodo = (id: number, newText: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    setTodos(todos.filter((todo) => todo.id !== id));
    setTrash([{ ...target, deletedAt: Date.now() }, ...trash]);
  };

  const restoreTodo = (id: number) => {
    const target = trash.find((t) => t.id === id);
    if (!target) return;
    const { deletedAt, ...restored } = target;
    setTrash(trash.filter((t) => t.id !== id));
    setTodos([restored, ...todos]);
  };

  const permanentlyDeleteTodo = (id: number) => {
    setTrash(trash.filter((t) => t.id !== id));
  };

  const emptyTrash = () => {
    setTrash([]);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-start p-6 sm:p-12 font-sans transition-colors">
      <main className="w-full max-w-xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
              TODO LIST
            </h1>
            <p className="text-xs text-[var(--color-muted)]">BPDS Project from me · Next.js CRUD</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] px-3 py-1 rounded-full font-medium">
              Total: {todos.length}
            </span>
            <span className="text-xs bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30 px-3 py-1 rounded-full font-medium">
              Hechas: {completedCount}
            </span>
          </div>
        </header>

        <input
          type="text"
          placeholder="Escribe una tarea y presiona Enter"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={addTodo}
          className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
        />

        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li className="text-center py-10 text-[var(--color-muted)] text-sm border border-dashed border-[var(--color-border)] rounded-xl">
              No hay tareas registradas. Escribe una arriba y presiona Enter.
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center justify-between gap-3 bg-[var(--color-background)]/50 hover:bg-[var(--color-background)] border border-[var(--color-border)] p-3 rounded-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    todo.completed
                      ? "bg-[var(--color-primary)] text-zinc-950 shadow-sm"
                      : "border border-[var(--color-border)] text-transparent hover:border-[var(--color-primary)]"
                  }`}
                >
                  ✓
                </button>

                <input
                  type="text"
                  value={todo.text}
                  onChange={(e) => updateTodo(todo.id, e.target.value)}
                  className={`flex-1 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50 rounded px-1 transition-all ${
                    todo.completed
                      ? "line-through text-[var(--color-muted)]"
                      : "text-[var(--color-foreground)]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-[var(--color-border)] pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTrash(!showTrash)}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] flex items-center gap-2 transition-colors"
          >
            <span className="w-5 h-5 rounded-md bg-[var(--color-background)] flex items-center justify-center border border-[var(--color-border)]">
              <TrashIcon className="w-3.5 h-3.5" />
            </span>
            Papelera ({trash.length})
            <span className="opacity-60">{showTrash ? "▲" : "▼"}</span>
          </button>
          {trash.length > 0 && showTrash && (
            <button
              type="button"
              onClick={emptyTrash}
              className="text-xs text-red-400/80 hover:text-red-400 transition-colors"
            >
              Vaciar papelera
            </button>
          )}
        </div>

        {showTrash && (
          <ul className="space-y-2">
            {trash.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-2 py-6 text-[var(--color-muted)] text-xs border border-dashed border-[var(--color-border)] rounded-xl">
                <TrashIcon className="w-6 h-6 opacity-40" />
                La papelera está vacía.
              </li>
            ) : (
              trash.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between gap-3 bg-[var(--color-background)]/30 border border-[var(--color-border)]/60 p-3 rounded-xl"
                >
                  <span className="flex-1 text-sm text-[var(--color-muted)] line-through truncate">
                    {todo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => restoreTodo(todo.id)}
                    className="text-xs text-[var(--color-secondary)] hover:opacity-80 p-1.5 rounded-lg hover:bg-[var(--color-secondary)]/10 transition-colors"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => permanentlyDeleteTodo(todo.id)}
                    className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Borrar
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

      </main>
    </div>
  );
}
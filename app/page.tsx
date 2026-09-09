"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  deletedAt?: number;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [trash, setTrash] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  // READ (Cargar de localStorage)
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

  // Persistir cambios (tareas activas)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bpds_todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Persistir cambios (papelera)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bpds_trash", JSON.stringify(trash));
    }
  }, [trash, isLoaded]);

  // CREATE (Únicamente con tecla Enter)
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

  // UPDATE (Tachar / Destachar)
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // UPDATE (Editar texto directamente)
  const updateTodo = (id: number, newText: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  // DELETE (envía a la papelera en vez de borrar)
  const deleteTodo = (id: number) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    setTodos(todos.filter((todo) => todo.id !== id));
    setTrash([{ ...target, deletedAt: Date.now() }, ...trash]);
  };

  // RESTORE (devolver de la papelera a la lista activa)
  const restoreTodo = (id: number) => {
    const target = trash.find((t) => t.id === id);
    if (!target) return;
    const { deletedAt, ...restored } = target;
    setTrash(trash.filter((t) => t.id !== id));
    setTodos([restored, ...todos]);
  };

  // PERMANENT DELETE (borrar definitivamente desde la papelera)
  const permanentlyDeleteTodo = (id: number) => {
    setTrash(trash.filter((t) => t.id !== id));
  };

  // Vaciar papelera completa
  const emptyTrash = () => {
    setTrash([]);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-start p-6 sm:p-12 font-sans">
      <main className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Encabezado y Estadísticas */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              TODO LIST
            </h1>
            <p className="text-xs text-zinc-400">BPDS Project · Next.js CRUD</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-medium">
              Total: {todos.length}
            </span>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">
              Hechas: {completedCount}
            </span>
          </div>
        </header>

        {/* CREATE Input (Sin botón) */}
        <input
          type="text"
          placeholder="Escribe una tarea y presiona Enter"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={addTodo}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />

        {/* READ & UPDATE & DELETE List */}
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li className="text-center py-10 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              No hay tareas registradas. Escribe una arriba y presiona Enter.
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center justify-between gap-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl transition-all"
              >
                {/* Botón Tachar/Completar */}
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    todo.completed
                      ? "bg-emerald-500 text-zinc-950"
                      : "border border-zinc-700 text-transparent hover:border-zinc-500"
                  }`}
                >
                  ✓
                </button>

                {/* Input Edición Inline */}
                <input
                  type="text"
                  value={todo.text}
                  onChange={(e) => updateTodo(todo.id, e.target.value)}
                  className={`flex-1 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 transition-all ${
                    todo.completed
                      ? "line-through text-zinc-500"
                      : "text-zinc-200"
                  }`}
                />

                {/* Botón Eliminar (envía a papelera) */}
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-xs text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Toggle Papelera */}
        <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTrash(!showTrash)}
            className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px]">
              🗑
            </span>
            Papelera ({trash.length})
            <span className="text-zinc-600">{showTrash ? "▲" : "▼"}</span>
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

        {/* Lista de la Papelera */}
        {showTrash && (
          <ul className="space-y-2">
            {trash.length === 0 ? (
              <li className="text-center py-6 text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
                La papelera está vacía.
              </li>
            ) : (
              trash.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between gap-3 bg-zinc-900/30 border border-zinc-800/60 p-3 rounded-xl"
                >
                  <span className="flex-1 text-sm text-zinc-500 line-through truncate">
                    {todo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => restoreTodo(todo.id)}
                    className="text-xs text-emerald-500/90 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => permanentlyDeleteTodo(todo.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
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
"use client"
import { useState } from "react";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

type TodoItem = RouterOutputs["todo"]["getAll"][0];

export default function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const utils = api.useContext();

  const { data: todos, isLoading } = api.todo.getAll.useQuery();

  const createTodo = api.todo.create.useMutation({
    async onMutate({ title }) {
      try {
        await utils.todo.getAll.cancel();
        const prevTodos = utils.todo.getAll.getData() ?? [];

        utils.todo.getAll.setData(undefined, (old) => {
          const newTodo: TodoItem = {
            id: `temp-${Date.now()}`,
            title,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [newTodo, ...(old ?? [])];
        });

        setNewTodo("");
        return { prevTodos };
      } catch (error) {
        console.error("Error in onMutate:", error);
        return { prevTodos: [] };
      }
    },
    onError(err, newTodo, ctx) {
      if (ctx?.prevTodos) {
        utils.todo.getAll.setData(undefined, ctx.prevTodos);
      }
      console.error("Error creating todo:", err);
    },
    onSettled: async () => {
      try {
        await utils.todo.getAll.invalidate();
      } catch (error) {
        console.error("Error invalidating queries:", error);
      }
    },
  });

  const toggleTodo = api.todo.toggle.useMutation({
    async onMutate({ id, completed }) {
      try {
        await utils.todo.getAll.cancel();
        const prevTodos = utils.todo.getAll.getData() ?? [];

        utils.todo.getAll.setData(undefined, (old) => {
          if (!old) return [];
          return old.map((todo) =>
            todo.id === id ? { ...todo, completed } : todo
          );
        });

        return { prevTodos };
      } catch (error) {
        console.error("Error in onMutate:", error);
        return { prevTodos: [] };
      }
    },
    onError(err, newTodo, ctx) {
      if (ctx?.prevTodos) {
        utils.todo.getAll.setData(undefined, ctx.prevTodos);
      }
      console.error("Error toggling todo:", err);
    },
    onSettled: async () => {
      try {
        await utils.todo.getAll.invalidate();
      } catch (error) {
        console.error("Error invalidating queries:", error);
      }
    },
  });

  const deleteTodo = api.todo.delete.useMutation({
    async onMutate({ id }) {
      try {
        // Prevent spam clicking by marking this ID as deleting
        setDeletingIds((prev) => new Set(prev).add(id));

        await utils.todo.getAll.cancel();
        const prevTodos = utils.todo.getAll.getData() ?? [];

        utils.todo.getAll.setData(undefined, (old) => {
          if (!old) return [];
          return old.filter((todo) => todo.id !== id);
        });

        return { prevTodos };
      } catch (error) {
        console.error("Error in onMutate:", error);
        return { prevTodos: [] };
      }
    },
    onError(err, variables, ctx) {
      if (ctx?.prevTodos) {
        utils.todo.getAll.setData(undefined, ctx.prevTodos);
      }
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.id);
        return newSet;
      });
      console.error("Error deleting todo:", err);
    },
    onSettled: async (_, __, variables) => {
      try {
        await utils.todo.getAll.invalidate();
        // Remove ID from deletingIds after operation is complete
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.id);
          return newSet;
        });
      } catch (error) {
        console.error("Error invalidating queries:", error);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        await createTodo.mutateAsync({ title: newTodo });
      } catch (error) {
        console.error("Error submitting todo:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Todo List</h1>
      
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1 rounded border p-2"
          placeholder="Add new todo..."
          disabled={createTodo.isLoading}
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2  hover:bg-blue-600 disabled:opacity-50"
          disabled={createTodo.isLoading}
        >
          {createTodo.isLoading ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="space-y-2">
        {todos?.map((todo) => {
          const isDeleting = deletingIds.has(todo.id);
          return (
            <div
              key={todo.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =>
                    void toggleTodo.mutate({
                      id: todo.id,
                      completed: !todo.completed,
                    })
                  }
                  className="h-4 w-4"
                  disabled={toggleTodo.isLoading || isDeleting}
                />
                <span
                  className={`${
                    todo.completed ? "text-gray-500 line-through" : ""
                  }`}
                >
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() =>
                  void deleteTodo.mutate({ id: todo.id })
                }
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
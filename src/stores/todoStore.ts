import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TodoState, Todo } from '../types';
import { storage } from '../utils/storage';

const initialTodos = storage.load();

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: initialTodos,

  addTodo: (dateStr: string, content: string) => {
    if (!content.trim()) return;

    const newTodo: Todo = {
      id: uuidv4(),
      content: content.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    set((state) => {
      const existingTodos = state.todos[dateStr] || [];
      const updatedTodos = {
        ...state.todos,
        [dateStr]: [newTodo, ...existingTodos],
      };
      storage.save(updatedTodos);
      return { todos: updatedTodos };
    });
  },

  toggleTodo: (dateStr: string, todoId: string) => {
    set((state) => {
      const existingTodos = state.todos[dateStr] || [];
      const updatedTodos = existingTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );
      const newState = {
        ...state.todos,
        [dateStr]: updatedTodos,
      };
      storage.save(newState);
      return { todos: newState };
    });
  },

  deleteTodo: (dateStr: string, todoId: string) => {
    set((state) => {
      const existingTodos = state.todos[dateStr] || [];
      const updatedTodos = existingTodos.filter((todo) => todo.id !== todoId);
      const newState = {
        ...state.todos,
        [dateStr]: updatedTodos,
      };
      storage.save(newState);
      return { todos: newState };
    });
  },

  deleteAllTodos: (dateStr: string) => {
    set((state) => {
      const newState = { ...state.todos };
      delete newState[dateStr];
      storage.save(newState);
      return { todos: newState };
    });
  },

  clearAllData: () => {
    set({ todos: {} });
    storage.clear();
  },

  updateTodoContent: (dateStr: string, todoId: string, newContent: string) => {
    if (!newContent.trim()) return;

    set((state) => {
      const existingTodos = state.todos[dateStr] || [];
      const updatedTodos = existingTodos.map((todo) =>
        todo.id === todoId ? { ...todo, content: newContent.trim() } : todo
      );
      const newState = {
        ...state.todos,
        [dateStr]: updatedTodos,
      };
      storage.save(newState);
      return { todos: newState };
    });
  },

  getTodosByDate: (dateStr: string) => {
    return get().todos[dateStr] || [];
  },

  getCompletedCount: (dateStr: string) => {
    const todos = get().todos[dateStr] || [];
    return todos.filter((todo) => todo.completed).length;
  },

  getTotalCount: (dateStr: string) => {
    const todos = get().todos[dateStr] || [];
    return todos.length;
  },

  getAllDatesWithTodos: () => {
    return Object.keys(get().todos).filter((dateStr) => {
      const todos = get().todos[dateStr];
      return todos && todos.length > 0;
    }).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  },

  hasTodos: (dateStr: string) => {
    const todos = get().todos[dateStr];
    return !!(todos && todos.length > 0);
  },
}));

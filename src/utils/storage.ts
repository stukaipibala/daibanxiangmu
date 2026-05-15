import type { DayTodos } from '../types';

const STORAGE_KEY = 'daily-todo-data';

export const storage = {
  load: (): DayTodos => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  save: (todos: DayTodos): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

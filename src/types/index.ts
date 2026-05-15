export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  createdAt: number;
}

export interface DayTodos {
  [dateStr: string]: Todo[];
}

export interface TodoState {
  todos: DayTodos;
  
  addTodo: (dateStr: string, content: string) => void;
  toggleTodo: (dateStr: string, todoId: string) => void;
  deleteTodo: (dateStr: string, todoId: string) => void;
  deleteAllTodos: (dateStr: string) => void;
  clearAllData: () => void;
  updateTodoContent: (dateStr: string, todoId: string, newContent: string) => void;
  
  getTodosByDate: (dateStr: string) => Todo[];
  getCompletedCount: (dateStr: string) => number;
  getTotalCount: (dateStr: string) => number;
  getAllDatesWithTodos: () => string[];
  hasTodos: (dateStr: string) => boolean;
}

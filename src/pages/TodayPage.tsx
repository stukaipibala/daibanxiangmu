import { useMemo } from 'react';
import { PageContainer } from '../components/PageContainer';
import { TodoInput } from '../components/TodoInput';
import { TodoList } from '../components/TodoList';
import { CompletedSection } from '../components/CompletedSection';
import { EmptyState } from '../components/EmptyState';
import { useTodoStore } from '../stores/todoStore';
import { formatFullDate, getTodayStr } from '../utils/date';

export function TodayPage() {
  const { addTodo, toggleTodo, deleteTodo, getTodosByDate } = useTodoStore();
  const todayStr = getTodayStr();
  const allTodos = useMemo(() => getTodosByDate(todayStr), [getTodosByDate, todayStr]);
  
  const pendingTodos = useMemo(
    () => allTodos.filter((todo) => !todo.completed),
    [allTodos]
  );
  
  const completedTodos = useMemo(
    () => allTodos.filter((todo) => todo.completed),
    [allTodos]
  );

  const handleAddTodo = (content: string) => {
    addTodo(todayStr, content);
  };

  const handleToggleTodo = (todoId: string) => {
    toggleTodo(todayStr, todoId);
  };

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todayStr, todoId);
  };

  return (
    <PageContainer>
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">今日待办</h1>
          <span className="text-sm text-gray-500">{formatFullDate(new Date())}</span>
        </div>
      </header>

      <main className="px-4">
        <TodoInput onAdd={handleAddTodo} />

        {allTodos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {pendingTodos.length > 0 && (
              <div className="mt-6">
                <TodoList
                  todos={pendingTodos}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                />
              </div>
            )}
            
            <CompletedSection
              todos={completedTodos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          </>
        )}
      </main>
    </PageContainer>
  );
}

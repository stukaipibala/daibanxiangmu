import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useTodoStore } from '../stores/todoStore';
import { formatDisplayDate, formatFullDate } from '../utils/date';
import { TodoItem } from './TodoItem';
import { EmptyState } from './EmptyState';

interface DateDetailProps {
  dateStr: string;
}

export function DateDetail({ dateStr }: DateDetailProps) {
  const { getTodosByDate, toggleTodo, deleteTodo } = useTodoStore();
  
  const allTodos = useMemo(() => getTodosByDate(dateStr), [getTodosByDate, dateStr]);
  
  const pendingTodos = useMemo(
    () => allTodos.filter((todo) => !todo.completed),
    [allTodos]
  );
  
  const completedTodos = useMemo(
    () => allTodos.filter((todo) => todo.completed),
    [allTodos]
  );
  
  const date = new Date(dateStr);
  const isToday = formatDisplayDate(date) === '今天';
  
  const handleToggleTodo = (todoId: string) => {
    toggleTodo(dateStr, todoId);
  };
  
  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(dateStr, todoId);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isToday ? '今日待办' : formatDisplayDate(date)}
            </h2>
            <p className="text-sm text-white/80">{formatFullDate(date)}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {allTodos.length === 0 ? (
          <EmptyState
            title="当天没有待办"
            description="这个日期还没有记录"
          />
        ) : (
          <>
            {pendingTodos.length > 0 && (
              <div className="space-y-3">
                {pendingTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggleTodo(todo.id)}
                    onDelete={() => handleDeleteTodo(todo.id)}
                  />
                ))}
              </div>
            )}
            
            {completedTodos.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>已完成 {completedTodos.length} 项</span>
                </div>
                <div className="space-y-3">
                  {completedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={() => handleToggleTodo(todo.id)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

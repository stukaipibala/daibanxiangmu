import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Todo } from '../types';
import { TodoItem } from './TodoItem';

interface CompletedSectionProps {
  todos: Todo[];
  onToggle: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export function CompletedSection({ todos, onToggle, onDelete }: CompletedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (todos.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
        <span>已完成 {todos.length} 项</span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => onToggle(todo.id)}
              onDelete={() => onDelete(todo.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

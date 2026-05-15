import { useState, useRef, useEffect, type TouchEvent } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const deleteWidth = 64;

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const diff = startXRef.current - e.touches[0].clientX;
    const newTranslateX = Math.max(0, Math.min(diff, deleteWidth));
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX > deleteWidth / 2) {
      setTranslateX(deleteWidth);
    } else {
      setTranslateX(0);
    }
  };

  useEffect(() => {
    if (!isDragging && translateX !== 0 && translateX !== deleteWidth) {
      setTranslateX(0);
    }
  }, [isDragging, translateX, deleteWidth]);

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={onDelete}
        className="absolute right-0 top-0 h-full w-16 bg-red-500 flex items-center justify-center transition-opacity"
        style={{ opacity: translateX > 0 ? 1 : 0 }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </button>
      
      <div
        className={`relative flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 transition-transform duration-200 ${
          isDragging ? '' : 'ease-out'
        }`}
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {todo.completed && <Check className="w-4 h-4 text-white" />}
        </button>
        
        <span
          className={`flex-1 text-sm ${
            todo.completed
              ? 'text-gray-400 line-through'
              : 'text-gray-700'
          }`}
        >
          {todo.content}
        </span>
      </div>
    </div>
  );
}

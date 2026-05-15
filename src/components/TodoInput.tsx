import { useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';

interface TodoInputProps {
  onAdd: (content: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-white rounded-xl border border-gray-100">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入待办事项..."
        className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

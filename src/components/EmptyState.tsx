import { CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = '还没有待办事项', 
  description = '输入一个待办，开始你的一天吧' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center">{description}</p>
    </div>
  );
}

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTodoStore } from '../stores/todoStore';
import { formatDateStr, getDaysInMonth, getWeekDays } from '../utils/date';

interface CalendarViewProps {
  onDateSelect: (dateStr: string) => void;
  selectedDate: string | null;
}

export function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const { hasTodos, getCompletedCount, getTotalCount } = useTodoStore();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(formatDateStr(today));
  };
  
  const formatMonthYear = () => {
    return `${year}年${month + 1}月`;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={goToToday}
          className="text-lg font-medium text-gray-800 hover:text-blue-500 transition-colors"
        >
          {formatMonthYear()}
        </button>
        
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}
        
        {days.map((day) => {
          const dateStr = formatDateStr(day);
          const dayNum = day.getDate();
          const isToday = formatDateStr(day) === formatDateStr(today);
          const isSelected = selectedDate === dateStr;
          const hasDayTodos = hasTodos(dateStr);
          const completedCount = getCompletedCount(dateStr);
          const totalCount = getTotalCount(dateStr);
          
          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`relative h-12 flex flex-col items-center justify-center rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : isToday
                  ? 'bg-blue-50 text-blue-500 font-medium'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              <span className="text-sm">{dayNum}</span>
              
              {hasDayTodos && (
                <span
                  className={`absolute bottom-1 text-xs ${
                    isSelected ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  {completedCount}/{totalCount}
                </span>
              )}
              
              {hasDayTodos && !isSelected && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-400">
        有记录的日期 <span className="inline-block w-2 h-2 rounded-full bg-green-500 align-middle mx-1"></span>
        · 今日 <span className="text-blue-500 font-medium">*</span>
      </div>
    </div>
  );
}

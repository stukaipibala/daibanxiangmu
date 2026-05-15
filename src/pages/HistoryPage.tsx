import { useState } from 'react';
import { PageContainer } from '../components/PageContainer';
import { CalendarView } from '../components/CalendarView';
import { DateDetail } from '../components/DateDetail';
import { getTodayStr } from '../utils/date';

export function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  return (
    <PageContainer>
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">历史记录</h1>
        <p className="text-sm text-gray-500 mt-1">查看过往日期的待办记录</p>
      </header>

      <main className="px-4 space-y-4">
        <CalendarView
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />

        {selectedDate && (
          <DateDetail dateStr={selectedDate} />
        )}

        {!selectedDate && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-500">点击日历上的日期查看详情</p>
            <button
              onClick={() => setSelectedDate(getTodayStr())}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              查看今日
            </button>
          </div>
        )}
      </main>
    </PageContainer>
  );
}

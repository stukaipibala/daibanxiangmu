import { format } from 'date-fns';

export const formatDateStr = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (formatDateStr(date) === formatDateStr(today)) {
    return '今天';
  }
  if (formatDateStr(date) === formatDateStr(yesterday)) {
    return '昨天';
  }
  
  return format(date, 'M月d日');
};

export const formatFullDate = (date: Date): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
};

export const getTodayStr = (): string => {
  return formatDateStr(new Date());
};

export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  for (let i = 0; i < lastDay.getDate(); i++) {
    days.push(new Date(year, month, i + 1));
  }
  
  return days;
};

export const getWeekDays = (): string[] => {
  return ['日', '一', '二', '三', '四', '五', '六'];
};

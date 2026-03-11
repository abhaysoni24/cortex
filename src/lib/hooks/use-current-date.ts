'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, startOfDay } from 'date-fns';

export function useCurrentDate() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    now,
    today: startOfDay(now),
    formatted: format(now, 'EEEE, MMMM d, yyyy'),
    shortFormatted: format(now, 'MMM d'),
    timeFormatted: format(now, 'h:mm a'),
    isToday: (date: Date) => isToday(date),
    isTomorrow: (date: Date) => isTomorrow(date),
  };
}

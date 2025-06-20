'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, AlertCircle } from 'lucide-react';
import { Listing, CalendarDay } from '@/types';
import { cn, formatPrice, detectPriceAnomalies } from '@/lib/utils';

interface CalendarViewProps {
  listings: Listing[];
  dateRange: { from: string; to: string };
  onDateSelect: (date: string) => void;
}

export function CalendarView({ listings, dateRange, onDateSelect }: CalendarViewProps) {
  const startDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);
  
  // Generate calendar days
  const calendarDays: CalendarDay[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayListings = listings.filter(l => l.performanceDate === dateStr);
    
    const lowestPrice = dayListings.length > 0
      ? Math.min(...dayListings.map(l => l.totalPrice))
      : 0;
    
    const hasAnomalies = dayListings.some(listing => {
      const anomalies = detectPriceAnomalies(listing, listings);
      return anomalies.some(a => a.severity === 'high');
    });
    
    calendarDays.push({
      date: dateStr,
      lowestPrice,
      availableCount: dayListings.length,
      hasAnomalies,
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group by week
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  // Add empty days at the beginning if needed
  const firstDayOfWeek = new Date(calendarDays[0].date).getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: '',
      lowestPrice: 0,
      availableCount: 0,
      hasAnomalies: false,
      isWeekend: false,
    });
  }
  
  calendarDays.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    // Fill the rest of the week with empty days
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        lowestPrice: 0,
        availableCount: 0,
        hasAnomalies: false,
        isWeekend: false,
      });
    }
    weeks.push(currentWeek);
  }
  
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
    .format(new Date(dateRange.from));
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Price Calendar</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Best deals</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span>Price anomaly</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-lg font-medium text-center mb-4">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                if (!day.date) {
                  return <div key={dayIndex} className="aspect-square" />;
                }
                
                const dayNumber = new Date(day.date).getDate();
                const isToday = day.date === new Date().toISOString().split('T')[0];
                
                return (
                  <button
                    key={day.date}
                    onClick={() => onDateSelect(day.date)}
                    disabled={day.availableCount === 0}
                    className={cn(
                      'aspect-square p-2 rounded-lg border transition-all relative',
                      'hover:shadow-md hover:border-primary/50',
                      day.availableCount === 0
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : day.hasAnomalies
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-white border-gray-200',
                      day.isWeekend && 'bg-blue-50',
                      isToday && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    <div className="text-sm font-medium">{dayNumber}</div>
                    {day.availableCount > 0 && (
                      <>
                        <div className="text-xs font-bold mt-1">
                          {formatPrice(day.lowestPrice)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {day.availableCount} options
                        </div>
                        {day.hasAnomalies && (
                          <TrendingDown className="absolute top-1 right-1 w-3 h-3 text-green-600" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
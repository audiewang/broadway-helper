'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter, AlertCircle } from 'lucide-react';
import { Show, SearchFilters } from '@/types';
import { cn } from '@/lib/utils';

interface SearchInterfaceProps {
  shows: Show[];
  onSearch: (filters: SearchFilters) => void;
}

export function SearchInterface({ shows, onSearch }: SearchInterfaceProps) {
  const [selectedShow, setSelectedShow] = useState<string>('1');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<string[]>(['Orchestra Center']);
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  const currentShow = shows.find(s => s.id === selectedShow);
  const sections = currentShow ? Object.keys(currentShow.sections) : [];
  
  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  const handleSearch = () => {
    if (!dateFrom || !dateTo) {
      alert('Please select a date range');
      return;
    }
    
    onSearch({
      showId: selectedShow,
      dateFrom,
      dateTo,
      sections: selectedSections,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Find Broadway Tickets</h2>
        <p className="text-gray-600">
          Search across all ticket sources to find the best deals and pricing anomalies
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Show
          </label>
          <select
            value={selectedShow}
            onChange={(e) => setSelectedShow(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {shows.map(show => (
              <option key={show.id} value={show.id}>
                {show.name}
                {show.specialNotes && (
                  <span className="text-gray-500"> ({show.specialNotes})</span>
                )}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || new Date().toISOString().split('T')[0]}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sections (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => handleSectionToggle(section)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedSections.includes(section)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {section}
              {currentShow?.sections[section] && (
                <span className="block text-xs opacity-80">
                  {currentShow.sections[section].typicalPrice}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price (optional)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="No limit"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      {currentShow?.specialNotes && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-md border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{currentShow.specialNotes}</p>
        </div>
      )}
      
      <button
        onClick={handleSearch}
        className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search All Sources
      </button>
    </div>
  );
}
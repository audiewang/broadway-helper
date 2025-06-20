'use client';

import { useState } from 'react';
import { AlertCircle, TrendingDown, Shield, Eye } from 'lucide-react';
import { SearchInterface } from '@/components/SearchInterface';
import { ResultsTable } from '@/components/ResultsTable';
import { CalendarView } from '@/components/CalendarView';
import { shows, sources, generateMockListings } from '@/lib/data';
import { SearchFilters, Listing } from '@/types';
import { getDateRange } from '@/lib/utils';

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    
    // Generate mock listings
    const allListings = generateMockListings();
    
    // Filter listings based on search criteria
    const filtered = allListings.filter(listing => {
      const matchesShow = listing.showId === filters.showId;
      const matchesDateRange = listing.performanceDate >= filters.dateFrom && 
                               listing.performanceDate <= filters.dateTo;
      const matchesSection = filters.sections.includes(listing.section);
      const matchesPrice = !filters.maxPrice || listing.totalPrice <= filters.maxPrice;
      
      return matchesShow && matchesDateRange && matchesSection && matchesPrice;
    });
    
    setFilteredListings(filtered);
    setSelectedDate(null);
  };
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Scroll to results
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const currentShow = searchFilters ? shows.find(s => s.id === searchFilters.showId) : null;
  const displayListings = selectedDate 
    ? filteredListings.filter(l => l.performanceDate === selectedDate)
    : filteredListings;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Broadway Price Tracker</h1>
          <p className="mt-2 text-gray-600">
            Find pricing anomalies and hidden deals across all ticket sources
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <TrendingDown className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-sm">Price Anomalies</h3>
              <p className="text-xs text-gray-600 mt-1">
                Find when Row B is $200 while others are $500+
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
              <h3 className="font-semibold text-sm">Resale Warnings</h3>
              <p className="text-xs text-gray-600 mt-1">
                Alerts when resale > official for same seats
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-sm">Official Sources</h3>
              <p className="text-xs text-gray-600 mt-1">
                Earn Audience Rewards on official sites
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Eye className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-sm">Complete View</h3>
              <p className="text-xs text-gray-600 mt-1">
                See ALL available tickets in one place
              </p>
            </div>
          </div>
          
          {/* Search Interface */}
          <SearchInterface shows={shows} onSearch={handleSearch} />
          
          {/* Results */}
          {searchFilters && filteredListings.length > 0 && (
            <>
              {/* Calendar View */}
              <CalendarView
                listings={filteredListings}
                dateRange={{ from: searchFilters.dateFrom, to: searchFilters.dateTo }}
                onDateSelect={handleDateSelect}
              />
              
              {/* Results Table */}
              <div id="results">
                <ResultsTable
                  listings={displayListings}
                  showName={currentShow?.name || ''}
                />
              </div>
              
              {selectedDate && (
                <div className="text-center">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    Show all dates
                  </button>
                </div>
              )}
            </>
          )}
          
          {searchFilters && filteredListings.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or selecting different dates
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
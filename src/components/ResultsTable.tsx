'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { Listing, PriceAnomaly } from '@/types';
import { cn, formatDate, formatPrice, detectPriceAnomalies } from '@/lib/utils';

interface ResultsTableProps {
  listings: Listing[];
  showName: string;
}

export function ResultsTable({ listings, showName }: ResultsTableProps) {
  // Group listings by date
  const listingsByDate = listings.reduce((acc, listing) => {
    const date = listing.performanceDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(listing);
    return acc;
  }, {} as Record<string, Listing[]>);
  
  // Sort dates
  const sortedDates = Object.keys(listingsByDate).sort();
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold">{showName} - Available Tickets</h3>
        <p className="text-gray-600 mt-1">
          {listings.length} tickets found across {sortedDates.length} dates
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section/Row
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alerts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedDates.map(date => (
              <React.Fragment key={date}>
                {listingsByDate[date]
                  .sort((a, b) => {
                    // Sort by section, then row, then price
                    if (a.section !== b.section) return a.section.localeCompare(b.section);
                    if (a.row !== b.row) return a.row.localeCompare(b.row);
                    return a.totalPrice - b.totalPrice;
                  })
                  .map((listing, index) => {
                    const anomalies = detectPriceAnomalies(listing, listings);
                    const hasHighSeverityAnomaly = anomalies.some(a => a.severity === 'high');
                    
                    return (
                      <tr
                        key={listing.id}
                        className={cn(
                          'hover:bg-gray-50',
                          hasHighSeverityAnomaly && 'bg-green-50 hover:bg-green-100'
                        )}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {index === 0 && (
                            <div>
                              <div className="font-medium">{formatDate(date)}</div>
                              <div className="text-gray-500 text-xs">{listing.performanceTime}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium">{listing.section}</div>
                          <div className="text-gray-500">Row {listing.row}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {listing.seats || `${listing.quantity} tickets`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                listing.source.type === 'official'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {listing.source.name}
                            </span>
                            {listing.source.hasRewards && (
                              <Star className="w-4 h-4 text-yellow-500" title="Audience Rewards" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-lg">{formatPrice(listing.totalPrice)}</div>
                          {listing.serviceFees > 0 && (
                            <div className="text-gray-500 text-xs">
                              +{formatPrice(listing.serviceFees)} fees
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="space-y-1">
                            {anomalies.map((anomaly, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'flex items-start gap-1.5 p-2 rounded text-xs',
                                  anomaly.type === 'unusually_low' && 'bg-green-100 text-green-800',
                                  anomaly.type === 'resale_overcharge' && 'bg-red-100 text-red-800',
                                  anomaly.type === 'rare_availability' && 'bg-amber-100 text-amber-800'
                                )}
                              >
                                {anomaly.type === 'unusually_low' && <TrendingDown className="w-4 h-4 flex-shrink-0" />}
                                {anomaly.type === 'resale_overcharge' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                                {anomaly.type === 'rare_availability' && <Star className="w-4 h-4 flex-shrink-0" />}
                                <span>{anomaly.message}</span>
                              </div>
                            ))}
                            {listing.specialOffer && (
                              <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {listing.specialOffer}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <a
                            href={listing.listingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
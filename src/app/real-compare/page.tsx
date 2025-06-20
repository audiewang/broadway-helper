'use client';

import { useState, useEffect } from 'react';
import { priceDataService, RealPriceData, PriceComparison } from '@/lib/services/price-data-service';
import { AlertTriangle, TrendingUp, Info, Database } from 'lucide-react';

export default function RealComparePage() {
  const [selectedShow, setSelectedShow] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [availableShows, setAvailableShows] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    // Load saved data
    priceDataService.loadFromLocalStorage();
    updateAvailableShows();
  }, []);

  const updateAvailableShows = () => {
    // This is a hack to get all shows - in production, we'd have a proper method
    const allData = priceDataService.getPricesForShow(''); // Get all
    const shows = Array.from(new Set(allData.map(d => d.showName)));
    setAvailableShows(shows);
    setDataCount(allData.length);
  };

  const handleShowSelect = (show: string) => {
    setSelectedShow(show);
    const showData = priceDataService.getPricesForShow(show);
    const dates = Array.from(new Set(showData.map(d => d.date))).sort();
    setAvailableDates(dates);
    setSelectedDate('');
    setComparisons([]);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedShow && date) {
      const comps = priceDataService.comparePrices(selectedShow, date);
      setComparisons(comps);
    }
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : '-';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'telecharge':
      case 'ticketmaster':
        return 'bg-green-100 text-green-800';
      case 'stubhub':
        return 'bg-orange-100 text-orange-800';
      case 'seatgeek':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real Broadway Price Comparison</h1>
          <p className="text-gray-600">Based on actual verified price data</p>
        </div>

        {/* Data Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Data Status</h2>
                <p className="text-gray-600">
                  {dataCount} price points collected across {availableShows.length} shows
                </p>
              </div>
            </div>
            <a
              href="/admin"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add More Data
            </a>
          </div>
        </div>

        {/* Show Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Show and Date</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Show</label>
              <select
                value={selectedShow}
                onChange={(e) => handleShowSelect(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select a show</option>
                {availableShows.map(show => (
                  <option key={show} value={show}>{show}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="w-full p-3 border rounded-lg"
                disabled={!selectedShow}
              >
                <option value="">Select a date</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {dataCount === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Price Data Yet</h3>
            <p className="text-gray-700 mb-4">
              Start by collecting real price data from ticket websites.
            </p>
            <a
              href="/admin"
              className="inline-block bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700"
            >
              Go to Data Entry
            </a>
          </div>
        )}

        {/* Price Comparisons */}
        {comparisons.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                Price Comparison for {selectedShow} on {selectedDate}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Section / Row
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Official Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Resale Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Markup %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sources
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisons.map((comp, idx) => (
                    <tr key={idx} className={comp.averageMarkup && comp.averageMarkup > 50 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{comp.section}</div>
                        <div className="text-sm text-gray-600">Row {comp.row}</div>
                      </td>
                      <td className="px-6 py-4">
                        {formatPrice(comp.officialPrice)}
                      </td>
                      <td className="px-6 py-4">
                        {comp.lowestResalePrice ? (
                          <div>
                            {formatPrice(comp.lowestResalePrice)} - {formatPrice(comp.highestResalePrice)}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {comp.averageMarkup !== undefined ? (
                          <span className={comp.averageMarkup > 25 ? 'text-red-600 font-semibold' : ''}>
                            +{comp.averageMarkup.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {comp.dataPoints.map((dp, i) => (
                            <span
                              key={i}
                              className={`px-2 py-1 text-xs rounded ${getSourceColor(dp.source)}`}
                            >
                              {dp.source}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {comp.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Detailed View */}
            <div className="px-6 py-4 border-t">
              <h3 className="font-semibold mb-4">Detailed Price Breakdown</h3>
              <div className="grid gap-4">
                {comparisons.map((comp, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{comp.section} Row {comp.row}</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {comp.dataPoints.map((dp, i) => (
                        <div key={i} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs rounded ${getSourceColor(dp.source)}`}>
                                {dp.source}
                              </span>
                              <div className="mt-1">
                                <div className="font-semibold">{formatPrice(dp.totalPrice)}</div>
                                <div className="text-xs text-gray-600">
                                  ${dp.price} + ${dp.fees} fees
                                </div>
                                {dp.seatNumbers && (
                                  <div className="text-xs text-gray-600">
                                    Seats: {dp.seatNumbers}
                                  </div>
                                )}
                              </div>
                            </div>
                            {dp.available && (
                              <span className="text-xs text-green-600">Available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            How This Works
          </h3>
          <ul className="space-y-1 text-sm">
            <li>• Price data is manually collected from actual ticket websites</li>
            <li>• Each price point is verified and includes exact fees</li>
            <li>• Comparisons show real differences between official and resale prices</li>
            <li>• Recommendations are based on actual markup percentages</li>
            <li>• Add more data points to improve accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
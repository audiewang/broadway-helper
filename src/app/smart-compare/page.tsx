'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface ServiceStatus {
  seatgeek: boolean;
  ticketmaster: boolean;
  browserless: boolean;
  recommendation: string;
}

interface PriceComparison {
  section: string;
  officialPrice: number;
  averageResalePrice: number;
  markup: string;
  recommendation: string;
}

export default function SmartComparePage() {
  const [showName, setShowName] = useState('Hamilton');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/prices?action=status');
      const status = await response.json();
      setServiceStatus(status);
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const searchPrices = async () => {
    setLoading(true);
    setError(null);
    setPriceData(null);

    try {
      const response = await fetch(`/api/prices?show=${encodeURIComponent(showName)}&date=${date}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch prices');
      }

      setPriceData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      telecharge: { color: 'bg-green-100 text-green-800', label: 'Official' },
      ticketmaster: { color: 'bg-green-100 text-green-800', label: 'Official' },
      seatgeek: { color: 'bg-blue-100 text-blue-800', label: 'Marketplace' },
      stubhub: { color: 'bg-orange-100 text-orange-800', label: 'Resale' }
    };
    
    return badges[source] || { color: 'bg-gray-100 text-gray-800', label: source };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Smart Broadway Price Comparison</h1>

        {/* Service Status */}
        {serviceStatus && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">API Service Status</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                {serviceStatus.seatgeek ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>SeatGeek API</span>
              </div>
              <div className="flex items-center gap-2">
                {serviceStatus.ticketmaster ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Ticketmaster API</span>
              </div>
              <div className="flex items-center gap-2">
                {serviceStatus.browserless ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Web Scraping</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{serviceStatus.recommendation}</p>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Show Name</label>
              <input
                type="text"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., Hamilton"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={searchPrices}
                disabled={loading || !showName}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Prices
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {priceData && (
          <>
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {priceData.data.showName} - {priceData.data.date}
              </h2>
              
              <div className="grid md:grid-cols-4 gap-4">
                {priceData.data.summary.lowestPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Lowest Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(priceData.data.summary.lowestPrice)}
                    </p>
                  </div>
                )}
                {priceData.data.summary.averagePrice && (
                  <div>
                    <p className="text-sm text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(priceData.data.summary.averagePrice)}
                    </p>
                  </div>
                )}
                {priceData.data.summary.highestPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Highest Price</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPrice(priceData.data.summary.highestPrice)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Sources Found</p>
                  <p className="text-2xl font-bold">{priceData.data.prices.length}</p>
                </div>
              </div>
            </div>

            {/* Price Listings */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Available Prices</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {priceData.data.prices.map((price: any, idx: number) => {
                      const badge = getSourceBadge(price.source);
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">{price.section}</td>
                          <td className="px-6 py-4">{price.row || '-'}</td>
                          <td className="px-6 py-4 font-semibold">{formatPrice(price.price)}</td>
                          <td className="px-6 py-4">
                            {price.available ? (
                              <span className="text-green-600">Available</span>
                            ) : (
                              <span className="text-gray-500">Check site</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparisons */}
            {priceData.comparisons && priceData.comparisons.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Comparisons
                </h2>
                <div className="space-y-4">
                  {priceData.comparisons.map((comp: PriceComparison, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{comp.section}</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Official Price</p>
                          <p className="font-semibold">{formatPrice(comp.officialPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Resale Price</p>
                          <p className="font-semibold">{formatPrice(comp.averageResalePrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Markup</p>
                          <p className="font-semibold text-red-600">{comp.markup}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Recommendation</p>
                          <p className="text-sm font-medium">{comp.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Setup Instructions */}
        {!serviceStatus || (!serviceStatus.seatgeek && !serviceStatus.ticketmaster && !serviceStatus.browserless) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <h3 className="font-semibold mb-2">Setup Required</h3>
            <p className="mb-4">To fetch real prices, add these to your .env.local file:</p>
            <pre className="bg-white p-4 rounded text-sm overflow-x-auto">
{`# SeatGeek API (Free tier available)
SEATGEEK_CLIENT_ID=your_client_id
SEATGEEK_CLIENT_SECRET=your_client_secret

# Ticketmaster API (Free)
TICKETMASTER_API_KEY=your_api_key

# Browserless (Optional, for scraping)
BROWSERLESS_API_KEY=your_api_key`}
            </pre>
            <p className="mt-4 text-sm">
              Get API keys from:{' '}
              <a href="https://platform.seatgeek.com/" className="text-blue-600 hover:underline">SeatGeek</a>,{' '}
              <a href="https://developer.ticketmaster.com/" className="text-blue-600 hover:underline">Ticketmaster</a>,{' '}
              <a href="https://www.browserless.io/" className="text-blue-600 hover:underline">Browserless</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
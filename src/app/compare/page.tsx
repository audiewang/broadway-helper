'use client';

import { useState } from 'react';
import { Search, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface PriceComparison {
  showName: string;
  date: string;
  section: string;
  row: string;
  telechargePrice?: number;
  stubhubPrice?: number;
  priceDifference?: number;
  percentageMarkup?: number;
  recommendation: string;
}

interface ComparisonResult {
  success: boolean;
  summary?: {
    showName: string;
    date: string;
    totalComparisons: number;
    anomaliesFound: number;
    averageMarkup: number;
    maxMarkup: number;
  };
  comparisons?: PriceComparison[];
  anomalies?: PriceComparison[];
  error?: string;
}

export default function ComparePricesPage() {
  const [showName, setShowName] = useState('Maybe Happy Ending');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/compare-prices?show=${encodeURIComponent(showName)}&date=${date}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to fetch price comparison. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return `$${price.toFixed(2)}`;
  };

  const formatPercentage = (percentage?: number) => {
    if (!percentage) return '-';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Broadway Price Comparison</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Show Name</label>
              <input
                type="text"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter show name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCompare}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Comparing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Compare Prices
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && result.success && result.summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Comparisons</p>
                    <p className="text-2xl font-bold">{result.summary.totalComparisons}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Anomalies Found</p>
                    <p className="text-2xl font-bold text-red-600">{result.summary.anomaliesFound}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Average Markup</p>
                    <p className="text-2xl font-bold">{formatPercentage(result.summary.averageMarkup)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Max Markup</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPercentage(result.summary.maxMarkup)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Anomalies Alert */}
            {result.anomalies && result.anomalies.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Price Anomalies Detected
                </h3>
                <div className="space-y-2">
                  {result.anomalies.map((anomaly, index) => (
                    <div key={index} className="bg-white rounded p-3">
                      <p className="font-medium">
                        {anomaly.section} Row {anomaly.row}: 
                        <span className="text-red-600 ml-2">
                          {formatPercentage(anomaly.percentageMarkup)} markup
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">{anomaly.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Comparison Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Price Comparison Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section / Row
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telecharge (Official)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        StubHub (Resale)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Markup %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.comparisons?.map((comp, index) => (
                      <tr key={index} className={comp.percentageMarkup && comp.percentageMarkup > 50 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{comp.section}</div>
                          <div className="text-sm text-gray-600">Row {comp.row}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatPrice(comp.telechargePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatPrice(comp.stubhubPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {comp.priceDifference ? (
                            <span className={comp.priceDifference > 0 ? 'text-red-600' : 'text-green-600'}>
                              {formatPrice(Math.abs(comp.priceDifference))}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {comp.percentageMarkup !== undefined ? (
                            <span className={comp.percentageMarkup > 20 ? 'text-red-600 font-semibold' : ''}>
                              {formatPercentage(comp.percentageMarkup)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">{comp.recommendation}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{result.error}</p>
          </div>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <p className="text-gray-700 mb-4">
              This tool compares official Broadway ticket prices from Telecharge with resale prices from StubHub.
            </p>
            <ul className="text-left max-w-2xl mx-auto space-y-2">
              <li>• Enter a show name and date to compare prices</li>
              <li>• See the markup percentage for each section and row</li>
              <li>• Get recommendations on where to buy</li>
              <li>• Spot price anomalies and unusual markups</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
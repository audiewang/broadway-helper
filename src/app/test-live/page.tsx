'use client';

import { useState } from 'react';

export default function TestLivePrices() {
  const [showName, setShowName] = useState('Maybe Happy Ending');
  const [date, setDate] = useState('2025-01-20');

  const sources = [
    {
      name: 'Telecharge (Official)',
      getUrl: (show: string) => `https://www.telecharge.com/search?q=${encodeURIComponent(show)}`,
      notes: 'Official box office prices'
    },
    {
      name: 'StubHub',
      getUrl: (show: string) => `https://www.stubhub.com/secure/search?q=${encodeURIComponent(show)}`,
      notes: 'Expect 20-50% markup'
    },
    {
      name: 'Theatr',
      getUrl: (show: string) => `https://www.theatr.com/search?query=${encodeURIComponent(show)}`,
      notes: 'Zero fees resale'
    },
    {
      name: 'TodayTix',
      getUrl: (show: string) => `https://www.todaytix.com/search?q=${encodeURIComponent(show)}`,
      notes: 'Rush tickets & discounts'
    },
    {
      name: 'SeatGeek',
      getUrl: (show: string) => `https://seatgeek.com/search?search=${encodeURIComponent(show)}`,
      notes: 'Deal scores available'
    }
  ];

  const openAllSources = () => {
    sources.forEach((source, index) => {
      setTimeout(() => {
        window.open(source.getUrl(showName), '_blank');
      }, index * 500); // Stagger opening to avoid popup blockers
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live Price Comparison Test</h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Manual Test</h2>
          <p className="mb-4">
            This will open multiple tabs to compare prices across different platforms.
            Look for the same seats and note the price differences!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Show Name</label>
              <input
                type="text"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter show name"
              />
            </div>
            
            <button
              onClick={openAllSources}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Open All Sources (Compare Prices)
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">What to Look For:</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Same Section Comparison:</strong> Find Orchestra Center on each site</li>
            <li><strong>Price Differences:</strong> Note how much StubHub marks up from Telecharge</li>
            <li><strong>Hidden Fees:</strong> Check final price after fees are added</li>
            <li><strong>Availability:</strong> Some sites may have seats others don't</li>
            <li><strong>Row Anomalies:</strong> Look for your Row B vs Row S example</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sources Overview:</h2>
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.name} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{source.name}</span>
                  <span className="text-gray-600 ml-2">- {source.notes}</span>
                </div>
                <a
                  href={source.getUrl(showName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Document the price differences you find</li>
            <li>Take screenshots of interesting anomalies</li>
            <li>Note which sites have the best deals</li>
            <li>Check if the pattern holds for other shows</li>
            <li>We'll build scrapers for the most valuable sources</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
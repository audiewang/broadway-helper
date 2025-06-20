'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, DollarSign, AlertTriangle, Info } from 'lucide-react';

interface TicketLink {
  vendor: string;
  url: string;
  type: string;
  fees?: string;
  notes?: string;
}

interface Show {
  id: string;
  name: string;
  theater: string;
  description: string;
  ticketLinks: {
    official: TicketLink[];
    resale: TicketLink[];
    discount: TicketLink[];
  };
  priceRanges: {
    [section: string]: { min: number; max: number };
  };
}

export default function CompareV2Page() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/shows-with-links');
      const data = await response.json();
      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      setLoading(false);
    }
  };

  const openAllLinks = (show: Show) => {
    // Open official source first
    if (show.ticketLinks.official[0]) {
      window.open(show.ticketLinks.official[0].url, '_blank');
    }
    
    // Then open resale sites with slight delay
    show.ticketLinks.resale.forEach((link, index) => {
      setTimeout(() => {
        window.open(link.url, '_blank');
      }, (index + 1) * 500);
    });
  };

  const formatPriceRange = (min: number, max: number) => {
    return `$${min} - $${max}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Broadway Ticket Price Comparison</h1>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            How to Save Money on Broadway Tickets
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-blue-900">Official Sources</h3>
              <p className="text-sm">Telecharge & Ticketmaster have face value prices with minimal fees</p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Resale Markets</h3>
              <p className="text-sm">StubHub & SeatGeek add 25-50% in fees - compare carefully!</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Discounts</h3>
              <p className="text-sm">TodayTix rush tickets & lotteries offer huge savings</p>
            </div>
          </div>
        </div>

        {/* Show Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {shows.map((show) => (
            <div
              key={show.id}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                selectedShow?.id === show.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedShow(show)}
            >
              <h3 className="text-xl font-bold mb-2">{show.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{show.theater}</p>
              <div className="space-y-1">
                {Object.entries(show.priceRanges).map(([section, range]) => (
                  <div key={section} className="flex justify-between text-sm">
                    <span className="capitalize">{section}:</span>
                    <span className="font-semibold">{formatPriceRange(range.min, range.max)}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAllLinks(show);
                }}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
              >
                Compare Prices →
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Comparison */}
        {selectedShow && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{selectedShow.name} - Ticket Sources</h2>
            
            {/* Official Sources */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Official Sources (Best Prices)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedShow.ticketLinks.official.map((link) => (
                  <a
                    key={link.vendor}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-green-200 rounded-lg p-4 hover:bg-green-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">{link.vendor}</h4>
                      <p className="text-sm text-gray-600">Face value prices</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Resale Markets */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-orange-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Resale Markets (Higher Prices)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedShow.ticketLinks.resale.map((link) => (
                  <a
                    key={link.vendor}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">{link.vendor}</h4>
                      <p className="text-sm text-gray-600">{link.fees || 'Service fees apply'}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Discount Options */}
            {selectedShow.ticketLinks.discount.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Discount Options
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedShow.ticketLinks.discount.map((link) => (
                    <a
                      key={link.vendor}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold">{link.vendor}</h4>
                        <p className="text-sm text-gray-600">{link.notes || 'Special offers'}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Compare Button */}
            <div className="border-t pt-6">
              <button
                onClick={() => openAllLinks(selectedShow)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Open All Sources in New Tabs
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will open multiple tabs - allow pop-ups for this site
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💡 Money-Saving Tips</h2>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Always check official sources first</strong> - Telecharge and Ticketmaster have face value prices</li>
            <li>• <strong>Resale sites add 25-50% in fees</strong> - The listed price is not what you\'ll pay</li>
            <li>• <strong>Try digital lotteries</strong> - Hamilton, Lion King, and many shows offer $10-50 lottery tickets</li>
            <li>• <strong>Rush tickets</strong> - Available same-day through TodayTix or at the box office</li>
            <li>• <strong>Tuesday-Thursday shows</strong> - Generally cheaper than weekend performances</li>
            <li>• <strong>Rear mezzanine</strong> - Often the best value with good sightlines</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

interface PriceEntry {
  id: string;
  showName: string;
  date: string;
  time: string;
  section: string;
  row: string;
  seatNumbers: string;
  price: number;
  fees: number;
  source: 'telecharge' | 'stubhub' | 'seatgeek' | 'other';
  verified: boolean;
  notes: string;
}

export default function AdminDataEntry() {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<PriceEntry>>({
    showName: 'Maybe Happy Ending',
    source: 'telecharge',
    verified: false,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PriceEntry = {
      id: Date.now().toString(),
      showName: currentEntry.showName || '',
      date: currentEntry.date || '',
      time: currentEntry.time || '8:00 PM',
      section: currentEntry.section || '',
      row: currentEntry.row || '',
      seatNumbers: currentEntry.seatNumbers || '',
      price: currentEntry.price || 0,
      fees: currentEntry.fees || 0,
      source: currentEntry.source || 'telecharge',
      verified: currentEntry.verified || false,
      notes: currentEntry.notes || '',
    };

    setEntries([...entries, newEntry]);
    
    // Keep show name and date for convenience
    setCurrentEntry({
      showName: currentEntry.showName,
      date: currentEntry.date,
      source: currentEntry.source,
      verified: false
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `broadway-prices-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const totalPrice = (entry: PriceEntry) => entry.price + entry.fees;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Broadway Price Data Entry</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Price Entry</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Show Name</label>
              <input
                type="text"
                value={currentEntry.showName || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, showName: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={currentEntry.date || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, date: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <select
                value={currentEntry.time || '8:00 PM'}
                onChange={(e) => setCurrentEntry({ ...currentEntry, time: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="2:00 PM">2:00 PM (Matinee)</option>
                <option value="3:00 PM">3:00 PM (Matinee)</option>
                <option value="7:00 PM">7:00 PM</option>
                <option value="7:30 PM">7:30 PM</option>
                <option value="8:00 PM">8:00 PM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <input
                type="text"
                value={currentEntry.section || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, section: e.target.value })}
                placeholder="Orchestra Center"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Row</label>
              <input
                type="text"
                value={currentEntry.row || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, row: e.target.value })}
                placeholder="B"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Seat Numbers</label>
              <input
                type="text"
                value={currentEntry.seatNumbers || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, seatNumbers: e.target.value })}
                placeholder="101-102"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price (per ticket)</label>
              <input
                type="number"
                value={currentEntry.price || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, price: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fees (per ticket)</label>
              <input
                type="number"
                value={currentEntry.fees || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, fees: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                value={currentEntry.source || 'telecharge'}
                onChange={(e) => setCurrentEntry({ ...currentEntry, source: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="telecharge">Telecharge (Official)</option>
                <option value="stubhub">StubHub</option>
                <option value="seatgeek">SeatGeek</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                type="text"
                value={currentEntry.notes || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                placeholder="Any special notes about this listing"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentEntry.verified || false}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, verified: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Verified on site</span>
              </label>
            </div>
            
            <div className="md:col-span-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Collected Price Data ({entries.length} entries)</h2>
            {entries.length > 0 && (
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Export JSON
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Show</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fees</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2">{entry.showName}</td>
                    <td className="px-4 py-2">
                      <div>{entry.date}</div>
                      <div className="text-sm text-gray-500">{entry.time}</div>
                    </td>
                    <td className="px-4 py-2">{entry.section}</td>
                    <td className="px-4 py-2">{entry.row}</td>
                    <td className="px-4 py-2">{entry.seatNumbers}</td>
                    <td className="px-4 py-2">${entry.price.toFixed(2)}</td>
                    <td className="px-4 py-2">${entry.fees.toFixed(2)}</td>
                    <td className="px-4 py-2 font-semibold">${totalPrice(entry).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        entry.source === 'telecharge' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {entry.verified ? '✓' : ''}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {entries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No data entries yet. Start by adding real price data from Telecharge or other sources.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to collect accurate data:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to Telecharge.com and search for the show</li>
            <li>Select a specific date and time</li>
            <li>Look at available seats and their prices</li>
            <li>Enter the exact price and fees shown</li>
            <li>Check "Verified" if you saw this price yourself</li>
            <li>Do the same for StubHub to compare prices</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
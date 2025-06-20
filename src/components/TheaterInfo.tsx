import type { Theater } from '@/types'

interface TheaterInfoProps {
  theater: Theater
}

export default function TheaterInfo({ theater }: TheaterInfoProps) {
  const getQualityStars = (score: number) => {
    return '★'.repeat(score) + '☆'.repeat(5 - score)
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Theater Information</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{theater.name}</h3>
          <p className="text-gray-600">{theater.address}</p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Seating Sections</h3>
          
          {Object.entries(theater.sections).map(([sectionName, section]) => (
            <div key={sectionName} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{sectionName}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500 mr-2">{getQualityStars(section.quality_score)}</span>
                    <span className="text-sm text-gray-500">({section.quality_score}/5)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">{section.price_range}</p>
                  <p className="text-sm text-gray-500">Price Range</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm font-medium text-gray-700">💡 Tip:</p>
                <p className="text-gray-600 mt-1">{section.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
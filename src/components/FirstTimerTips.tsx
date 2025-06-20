import type { ShowData, EducationalContent } from '@/types'

interface FirstTimerTipsProps {
  show: ShowData
  educationalContent: EducationalContent
}

export default function FirstTimerTips({ show, educationalContent }: FirstTimerTipsProps) {
  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for First-Timers</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Tips */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">✅</span> Essential Tips
            </h3>
            <ul className="space-y-3">
              {educationalContent.first_timer_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-gray-600">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Common Mistakes */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚠️</span> Common Mistakes to Avoid
            </h3>
            <ul className="space-y-3">
              {educationalContent.common_mistakes.map((mistake, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">•</span>
                  <span className="text-gray-600">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Show-specific reminder */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-semibold text-yellow-800 mb-2">
            Remember for {show.name}:
          </h4>
          <p className="text-yellow-700">{show.newbie_tip}</p>
        </div>
        
        {/* Quick Checklist */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Pre-Show Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 text-gray-600">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Arrived 30 minutes early</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-600">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Phone on silent/off</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-600">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Used restroom before show</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-600">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Checked coat if needed</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}
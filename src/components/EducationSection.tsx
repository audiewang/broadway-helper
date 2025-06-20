import { AlertCircle, Lightbulb } from 'lucide-react'
import { EducationalContent } from '@/types'

interface EducationSectionProps {
  content: EducationalContent
}

export default function EducationSection({ content }: EducationSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Broadway Insider Knowledge
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* First Timer Tips */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">First Timer Tips</h3>
            </div>
            <ul className="space-y-4">
              {content.first_timer_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">Common Mistakes to Avoid</h3>
            </div>
            <ul className="space-y-4">
              {content.common_mistakes.map((mistake, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{mistake}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Tips Banner */}
        <div className="mt-12 bg-purple-100 rounded-xl p-6 text-center">
          <p className="text-purple-900 text-lg">
            <strong>Pro Tip:</strong> Join our newsletter to get exclusive discount codes and early access to popular shows!
          </p>
        </div>
      </div>
    </section>
  )
}
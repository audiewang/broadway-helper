import type { ShowData } from '@/types'

interface ShowDetailsProps {
  show: ShowData
}

export default function ShowDetails({ show }: ShowDetailsProps) {
  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{show.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Theater</h2>
            <p className="text-gray-600">{show.theater}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Fun Fact</h2>
            <p className="text-gray-600">{show.fun_fact}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Newbie Tip</h3>
          <p className="text-blue-800">{show.newbie_tip}</p>
        </div>
      </div>
    </section>
  )
}
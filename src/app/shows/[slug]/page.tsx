import { notFound } from 'next/navigation'
import ShowDetails from '@/components/ShowDetails'
import TheaterInfo from '@/components/TheaterInfo'
import FirstTimerTips from '@/components/FirstTimerTips'
import data from '../../../../initial-data.json'
import type { ShowData, Theater, EducationalContent } from '@/types'

interface ShowPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return data.shows.map((show) => ({
    slug: show.slug,
  }))
}

export default function ShowPage({ params }: ShowPageProps) {
  const { slug } = params
  
  // Find the show by slug
  const show = data.shows.find((s) => s.slug === slug) as ShowData | undefined
  
  if (!show) {
    notFound()
  }
  
  // Find the theater for this show
  const theater = data.theaters.find((t) => t.name === show.theater) as Theater | undefined
  
  if (!theater) {
    notFound()
  }
  
  const educationalContent = data.educational_content as EducationalContent

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Show Details Section */}
          <ShowDetails show={show} />
          
          {/* Theater Information Section */}
          <TheaterInfo theater={theater} />
          
          {/* First Timer Tips Section */}
          <FirstTimerTips 
            show={show} 
            educationalContent={educationalContent} 
          />
        </div>
      </main>
    </div>
  )
}
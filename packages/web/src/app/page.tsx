'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { SearchResults } from '@/components/SearchResults'
import { TorrentResult, SearchOptions } from '@torrent-search/api'

export default function Home() {
  const [results, setResults] = useState<TorrentResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [executionTime, setExecutionTime] = useState(0)

  const handleSearch = async (options: SearchOptions) => {
    setLoading(true)
    setSearchQuery(options.query)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error('Ошибка поиска')
      }

      const data = await response.json()
      setResults(data.results)
      setExecutionTime(data.executionTime)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Поиск фильмов, сериалов и мультфильмов
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Найдите нужный контент на различных торрент-трекерах. 
          Поддерживается поиск по RuTracker, ThePirateBay, 1337x и другим трекерам.
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <SearchResults 
          results={results} 
          query={searchQuery}
          executionTime={executionTime}
        />
      )}

      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            По запросу "{searchQuery}" ничего не найдено
          </p>
        </div>
      )}
    </div>
  )
}
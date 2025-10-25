'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { SearchOptions } from '@torrent-search/api'

interface SearchFormProps {
  onSearch: (options: SearchOptions) => void
  loading: boolean
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | 'movie' | 'series' | 'cartoon'>('all')
  const [year, setYear] = useState('')
  const [quality, setQuality] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const options: SearchOptions = {
      query: query.trim(),
      category: category === 'all' ? undefined : category,
      year: year ? parseInt(year) : undefined,
      quality: quality || undefined,
      limit: 50
    }

    onSearch(options)
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Введите название фильма, сериала или мультфильма..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input w-full"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary btn-lg px-6"
          >
            <Search className="w-5 h-5 mr-2" />
            {loading ? 'Поиск...' : 'Найти'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="input w-full"
                disabled={loading}
              >
                <option value="all">Все</option>
                <option value="movie">Фильмы</option>
                <option value="series">Сериалы</option>
                <option value="cartoon">Мультфильмы</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Год
              </label>
              <input
                type="number"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input w-full"
                disabled={loading}
                min="1900"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Качество
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="input w-full"
                disabled={loading}
              >
                <option value="">Любое</option>
                <option value="4K">4K</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="BluRay">BluRay</option>
                <option value="WEBRip">WEBRip</option>
                <option value="HDTV">HDTV</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
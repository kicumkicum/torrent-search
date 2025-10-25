'use client'

import { useState } from 'react'
import { Download, Magnet, ExternalLink, Users, HardDrive, Calendar, Volume2, Building2 } from 'lucide-react'
import { TorrentResult } from '@torrent-search/api'

interface SearchResultsProps {
  results: TorrentResult[]
  query: string
  executionTime: number
}

export function SearchResults({ results, query, executionTime }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'seeders' | 'size' | 'title'>('seeders')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedResults = [...results].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'seeders':
        aValue = a.seeders
        bValue = b.seeders
        break
      case 'size':
        aValue = a.sizeBytes
        bValue = b.sizeBytes
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleDownload = (result: TorrentResult) => {
    if (result.torrentUrl) {
      if (result.torrentUrl.startsWith('data:')) {
        // Скачиваем base64 данные
        const link = document.createElement('a')
        link.href = result.torrentUrl
        link.download = `${result.title}.torrent`
        link.click()
      } else {
        window.open(result.torrentUrl, '_blank')
      }
    }
  }

  const handleMagnet = (result: TorrentResult) => {
    if (result.magnetUrl) {
      window.open(result.magnetUrl, '_blank')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'movie':
        return 'bg-blue-100 text-blue-800'
      case 'series':
        return 'bg-green-100 text-green-800'
      case 'cartoon':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'movie':
        return 'Фильм'
      case 'series':
        return 'Сериал'
      case 'cartoon':
        return 'Мультфильм'
      default:
        return 'Другое'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Найдено результатов: {results.length}
          </h2>
          <span className="text-sm text-gray-500">
            Время поиска: {executionTime}мс
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Сортировка:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input w-32"
          >
            <option value="seeders">Сиды</option>
            <option value="size">Размер</option>
            <option value="title">Название</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn btn-secondary btn-sm"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Название</th>
                <th className="table-head">Категория</th>
                <th className="table-head">Год</th>
                <th className="table-head">Размер</th>
                <th className="table-head">Студия</th>
                <th className="table-head">Звук</th>
                <th className="table-head">Сиды/Личи</th>
                <th className="table-head">Трекер</th>
                <th className="table-head">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => (
                <tr key={result.id} className="table-row">
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {result.title}
                      </div>
                      {result.quality && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {result.quality}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryColor(result.category)}`}>
                      {getCategoryLabel(result.category)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {result.year && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {result.year}
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-600">
                      <HardDrive className="w-4 h-4 mr-1" />
                      {result.size}
                    </div>
                  </td>
                  <td className="table-cell">
                    {result.studio && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-1" />
                        {result.studio}
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    {result.audioTracks.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Volume2 className="w-4 h-4 mr-1" />
                        <span className="truncate max-w-32">
                          {result.audioTracks.join(', ')}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-600 font-medium">{result.seeders}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">{result.leechers}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-600">
                      {result.tracker}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {result.torrentUrl && (
                        <button
                          onClick={() => handleDownload(result)}
                          className="btn btn-primary btn-sm"
                          title="Скачать .torrent"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {result.magnetUrl && (
                        <button
                          onClick={() => handleMagnet(result)}
                          className="btn btn-secondary btn-sm"
                          title="Magnet ссылка"
                        >
                          <Magnet className="w-4 h-4" />
                        </button>
                      )}
                      {result.torrentUrl && !result.torrentUrl.startsWith('data:') && (
                        <button
                          onClick={() => window.open(result.torrentUrl, '_blank')}
                          className="btn btn-secondary btn-sm"
                          title="Открыть в новой вкладке"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
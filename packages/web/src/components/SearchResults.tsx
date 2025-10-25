'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, Magnet, ExternalLink, Users, HardDrive, Calendar, Volume2, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { TorrentResult } from '@torrent-search/api'

interface SearchResultsProps {
  results: TorrentResult[]
  query: string
  executionTime: number
}

export function SearchResults({ results, query, executionTime }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'seeders' | 'size' | 'title'>('seeders')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showScrollIndicators, setShowScrollIndicators] = useState({ left: false, right: true })
  const [isCompactMode, setIsCompactMode] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

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

  const checkScrollIndicators = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
      setShowScrollIndicators({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      })
    }
  }

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableRef.current) {
      const scrollAmount = 300
      const newScrollLeft = tableRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      tableRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    checkScrollIndicators()
    const table = tableRef.current
    if (table) {
      table.addEventListener('scroll', checkScrollIndicators)
      return () => table.removeEventListener('scroll', checkScrollIndicators)
    }
  }, [results])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Найдено результатов: {results.length}
          </h2>
          <span className="text-sm text-gray-500">
            Время поиска: {executionTime}мс
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCompactMode(!isCompactMode)}
            className={`btn btn-sm ${isCompactMode ? 'btn-primary' : 'btn-secondary'}`}
            title={isCompactMode ? 'Обычный режим' : 'Компактный режим'}
          >
            {isCompactMode ? 'Развернуть' : 'Свернуть'}
          </button>
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

      <div className="card overflow-hidden relative">
        {/* Scroll indicators */}
        {showScrollIndicators.left && (
          <button
            onClick={() => scrollTable('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 btn btn-secondary btn-sm shadow-lg"
            title="Прокрутить влево"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {showScrollIndicators.right && (
          <button
            onClick={() => scrollTable('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 btn btn-secondary btn-sm shadow-lg"
            title="Прокрутить вправо"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        <div ref={tableRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className={`table ${isCompactMode ? 'text-xs' : ''}`}>
            <thead className="table-header">
              <tr>
                <th className={`table-head ${isCompactMode ? 'w-80 min-w-80' : 'w-96 min-w-96'} sticky left-0 bg-white z-10`}>Название</th>
                <th className={`table-head ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'} hidden sm:table-cell`}>Категория</th>
                <th className={`table-head ${isCompactMode ? 'w-16 min-w-16' : 'w-20 min-w-20'} hidden md:table-cell`}>Год</th>
                <th className={`table-head ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'}`}>Размер</th>
                <th className={`table-head ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} hidden lg:table-cell`}>Студия</th>
                <th className={`table-head ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} hidden xl:table-cell`}>Звук</th>
                <th className={`table-head ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'}`}>Сиды/Личи</th>
                <th className={`table-head ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'} hidden sm:table-cell`}>Трекер</th>
                <th className={`table-head ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} sticky right-0 bg-white z-10`}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => (
                <tr key={result.id} className="table-row">
                  <td className={`table-cell ${isCompactMode ? 'w-80 min-w-80' : 'w-96 min-w-96'} sticky left-0 bg-white z-10`}>
                    <div className="space-y-1">
                      <div className={`font-medium text-gray-900 ${isCompactMode ? 'line-clamp-1' : 'line-clamp-2'}`}>
                        {result.title}
                      </div>
                      {result.quality && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {result.quality}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'} hidden sm:table-cell`}>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryColor(result.category)}`}>
                      {getCategoryLabel(result.category)}
                    </span>
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-16 min-w-16' : 'w-20 min-w-20'} hidden md:table-cell`}>
                    {result.year && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {result.year}
                      </div>
                    )}
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'}`}>
                    <div className="flex items-center text-sm text-gray-600">
                      <HardDrive className="w-4 h-4 mr-1" />
                      {result.size}
                    </div>
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} hidden lg:table-cell`}>
                    {result.studio && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-1" />
                        <span className="truncate">{result.studio}</span>
                      </div>
                    )}
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} hidden xl:table-cell`}>
                    {result.audioTracks.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Volume2 className="w-4 h-4 mr-1" />
                        <span className="truncate">
                          {result.audioTracks.join(', ')}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'}`}>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-600 font-medium">{result.seeders}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">{result.leechers}</span>
                    </div>
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-20 min-w-20' : 'w-24 min-w-24'} hidden sm:table-cell`}>
                    <span className="text-sm text-gray-600">
                      {result.tracker}
                    </span>
                  </td>
                  <td className={`table-cell ${isCompactMode ? 'w-24 min-w-24' : 'w-32 min-w-32'} sticky right-0 bg-white z-10`}>
                    <div className="flex items-center space-x-1">
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
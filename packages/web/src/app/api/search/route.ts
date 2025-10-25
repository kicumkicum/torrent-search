import { NextRequest, NextResponse } from 'next/server'
import { TorrentSearch, SearchOptions } from '@torrent-search/api'

const torrentSearch = new TorrentSearch()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const options: SearchOptions = {
      query: body.query,
      category: body.category,
      year: body.year,
      quality: body.quality,
      limit: body.limit || 50
    }

    if (!options.query || options.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const results = await torrentSearch.search(options)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
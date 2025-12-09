import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch data from Spekter.io API
    const response = await fetch('https://www.spekter.io/api/index', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the JSON data with proper headers
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching Spekter.io data:', error);
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout - Spekter.io API did not respond in time' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch data from Spekter.io API' },
      { status: 500 }
    );
  }
}
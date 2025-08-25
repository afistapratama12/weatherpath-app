import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          units: 'metric',
          appid: process.env.OPENWEATHER_API_KEY || '',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Weather error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to get weather data',
        details: error.response?.data?.message || error.message 
      },
      { status: 500 }
    );
  }
}

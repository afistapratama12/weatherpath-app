import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromLat, fromLon, toLat, toLon, vehicleType = 'driving' } = body;

    if (!fromLat || !fromLon || !toLat || !toLon) {
      return NextResponse.json(
        { error: 'All coordinates are required' },
        { status: 400 }
      );
    }

    // Map vehicle types to OpenRouteService profiles
    const profileMap: Record<string, string> = {
      driving: 'driving-car',
      cycling: 'cycling-regular',
      walking: 'foot-walking',
    };

    const profile = profileMap[vehicleType] || 'driving-car';

    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        coordinates: [[fromLon, fromLat], [toLon, toLat]],
        format: 'geojson',
      },
      {
        headers: {
          'Authorization': process.env.OPENROUTESERVICE_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Route error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to get route',
        details: error.response?.data?.error?.message || error.message 
      },
      { status: 500 }
    );
  }
}

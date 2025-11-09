import { NextResponse } from 'next/server';

// Endpoint de santé pour Docker healthcheck
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'blink Invoice App'
  });
}

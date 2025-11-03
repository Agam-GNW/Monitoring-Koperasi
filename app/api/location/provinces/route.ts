import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://wilayah.id/api/provinces.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    
    // Fallback data
    const fallbackData = {
      data: [
        { code: '11', name: 'ACEH' },
        { code: '12', name: 'SUMATERA UTARA' },
        { code: '13', name: 'SUMATERA BARAT' },
        { code: '14', name: 'RIAU' },
        { code: '15', name: 'JAMBI' },
        { code: '16', name: 'SUMATERA SELATAN' },
        { code: '17', name: 'BENGKULU' },
        { code: '18', name: 'LAMPUNG' },
        { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
        { code: '21', name: 'KEPULAUAN RIAU' },
        { code: '31', name: 'DKI JAKARTA' },
        { code: '32', name: 'JAWA BARAT' },
        { code: '33', name: 'JAWA TENGAH' },
        { code: '34', name: 'DI YOGYAKARTA' },
        { code: '35', name: 'JAWA TIMUR' },
        { code: '36', name: 'BANTEN' },
        { code: '51', name: 'BALI' },
        { code: '52', name: 'NUSA TENGGARA BARAT' },
        { code: '53', name: 'NUSA TENGGARA TIMUR' },
        { code: '61', name: 'KALIMANTAN BARAT' },
        { code: '62', name: 'KALIMANTAN TENGAH' },
        { code: '63', name: 'KALIMANTAN SELATAN' },
        { code: '64', name: 'KALIMANTAN TIMUR' },
        { code: '65', name: 'KALIMANTAN UTARA' },
        { code: '71', name: 'SULAWESI UTARA' },
        { code: '72', name: 'SULAWESI TENGAH' },
        { code: '73', name: 'SULAWESI SELATAN' },
        { code: '74', name: 'SULAWESI TENGGARA' },
        { code: '75', name: 'GORONTALO' },
        { code: '76', name: 'SULAWESI BARAT' },
        { code: '81', name: 'MALUKU' },
        { code: '82', name: 'MALUKU UTARA' },
        { code: '91', name: 'PAPUA BARAT' },
        { code: '94', name: 'PAPUA' },
      ]
    };
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

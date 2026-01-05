import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Testar conexão com banco
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco OK',
      userCount,
      database: 'Conectado',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 })
  }
}


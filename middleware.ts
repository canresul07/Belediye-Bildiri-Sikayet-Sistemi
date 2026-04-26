import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Şikayet formu koruması
  if (request.nextUrl.pathname.startsWith('/sikayet/yeni') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin panel koruması
  if (request.nextUrl.pathname.startsWith('/panel') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Profil koruması
  if (request.nextUrl.pathname.startsWith('/profilim') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|leaflet/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

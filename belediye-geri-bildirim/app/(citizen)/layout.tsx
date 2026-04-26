'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Building2,
  PlusCircle,
  User,
  LogIn,
  LogOut,
  Map,
  Shield,
} from 'lucide-react'

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const isAdmin = profile?.role === 'belediye_yetkilisi' || profile?.role === 'super_admin'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent leading-tight">
                BelediyeGeriBildirim
              </h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">Antalya Şikayet Platformu</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                className={pathname === '/' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
              >
                <Map className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Harita</span>
              </Button>
            </Link>

            {user && (
              <Link href="/sikayet/yeni">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sorun Bildir</span>
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link href="/panel">
                <Button variant="ghost" size="sm">
                  <Shield className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Panel</span>
                </Button>
              </Link>
            )}

            {loading ? (
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/profilim">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">
                      {profile?.full_name || 'Profil'}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Giriş
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2026 BelediyeGeriBildirim — Antalya</p>
          <p className="mt-1">Şehrimiz için daha iyi bir gelecek inşa ediyoruz 🌿</p>
        </div>
      </footer>
    </div>
  )
}

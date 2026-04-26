'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Building2,
  LayoutDashboard,
  FileText,
  BarChart3,
  ArrowLeft,
  LogOut,
  Shield,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const NAV_ITEMS = [
  { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/panel/sikayetler', label: 'Şikayetler', icon: FileText },
  { href: '/panel/istatistikler', label: 'İstatistikler', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (profile && !['belediye_yetkilisi', 'super_admin'].includes(profile.role)) {
        router.push('/')
      }
    }
  }, [user, profile, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-64 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
                Admin Panel
              </p>
              <p className="text-[10px] text-gray-400">Belediye Yönetimi</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

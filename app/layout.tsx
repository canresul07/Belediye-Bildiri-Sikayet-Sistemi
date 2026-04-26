import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BelediyeGeriBildirim — Antalya Şikayet ve Geri Bildirim Sistemi",
  description:
    "Antalya'daki sokak sorunlarını fotoğrafla bildirin, harita üzerinde takip edin. Belediye şeffaf çözüm platformu.",
  keywords: ["belediye", "şikayet", "antalya", "geri bildirim", "kent", "sorun bildirimi"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            className: "font-sans",
          }}
        />
      </body>
    </html>
  )
}

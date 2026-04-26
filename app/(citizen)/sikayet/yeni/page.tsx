import ComplaintForm from '@/components/complaint/ComplaintForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewComplaintPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Ana Sayfaya Dön
        </Link>
        
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold">🏛️ Sorun Bildir</h1>
          <p className="text-white/80 mt-1">
            Şehrimizdeki bir sorunu bildirin, biz takip edelim.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <ComplaintForm />
      </div>
    </div>
  )
}

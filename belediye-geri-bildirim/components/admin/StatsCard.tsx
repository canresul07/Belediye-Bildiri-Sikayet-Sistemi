interface Props {
  title: string
  value: number
  icon: string
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red'
}

const COLOR_MAP = {
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-700 border-red-200',
}

const ICON_BG_MAP = {
  blue:   'bg-blue-100',
  yellow: 'bg-yellow-100',
  orange: 'bg-orange-100',
  green:  'bg-green-100',
  red:    'bg-red-100',
}

export default function StatsCard({ title, value, icon, color }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${COLOR_MAP[color]} transition-all hover:shadow-md hover:scale-[1.02]`}>
      <div className={`w-10 h-10 ${ICON_BG_MAP[color]} rounded-lg flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value.toLocaleString('tr-TR')}</div>
      <div className="text-sm font-medium opacity-80 mt-1">{title}</div>
    </div>
  )
}

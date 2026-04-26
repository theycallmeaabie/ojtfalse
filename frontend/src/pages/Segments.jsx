import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import { fetchSegments } from '../api'

const SEGMENT_CONFIG = [
  {
    label: 'VIP',
    description: 'Highest-value customers. Frequent buyers with large orders. Requires priority attention.',
    icon: 'diamond',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    badge: 'Top Tier',
    badgeCls: 'bg-purple-100 text-purple-800',
    accent: 'border-l-4 border-primary',
  },
  {
    label: 'Loyal',
    description: 'Regular customers with a high purchase frequency. Core of your recurring revenue.',
    icon: 'favorite',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    badge: 'Healthy',
    badgeCls: 'bg-green-100 text-green-800',
    accent: '',
  },
  {
    label: 'At Risk',
    description: "Previously active customers who haven't purchased recently. Prime re-engagement candidates.",
    icon: 'warning',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    badge: 'Monitor',
    badgeCls: 'bg-yellow-100 text-yellow-800',
    accent: '',
  },
  {
    label: 'Inactive',
    description: 'Customers with no activity for an extended period. Require aggressive win-back strategies.',
    icon: 'bedtime',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-on-surface-variant',
    badge: 'Dormant',
    badgeCls: 'bg-gray-100 text-gray-800',
    accent: '',
  },
]

function assignLabels(averages, counts) {
  // Sort by Monetary desc → VIP, Loyal, At Risk, Inactive
  const sorted = [...averages].sort((a, b) => b.monetary - a.monetary)
  const countMap = Object.fromEntries(counts.map(c => [c.cluster, c.customers]))
  return sorted.map((seg, i) => ({
    ...seg,
    ...SEGMENT_CONFIG[i] || SEGMENT_CONFIG[3],
    customers: countMap[seg.cluster] || 0,
  }))
}

export default function Segments() {
  const [data, setData] = useState({ averages: [], counts: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSegments().then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const segments = data.averages.length > 0 ? assignLabels(data.averages, data.counts) : []

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Customer Segments" />

      <div className="flex-1 overflow-y-auto p-gutter bg-surface">
        <div className="max-w-[1440px] mx-auto">

          <div className="mb-8 mt-4 md:mt-0">
            <h1 className="text-[30px] font-bold text-on-surface mb-2">Customer Segments</h1>
            <p className="text-[16px] text-on-surface-variant">
              Customer clusters based on Recency, Frequency, and Monetary purchasing behavior.
            </p>
          </div>

          {loading ? (
            <p className="text-on-surface-variant">Loading segments…</p>
          ) : segments.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-gutter text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-3 block">group_off</span>
              <p className="text-on-surface-variant">No data yet — upload a file on the Add Data page to generate segments.</p>
              <a href="/add-data" className="text-primary text-[14px] font-semibold mt-2 inline-block hover:underline">Go to Add Data</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  className={`bg-white rounded-lg p-6 shadow-level-1 border border-transparent hover:border-primary transition-colors flex flex-col h-full ${seg.accent}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${seg.iconBg} flex items-center justify-center ${seg.iconColor}`}>
                        <span className="material-symbols-outlined icon-filled">{seg.icon}</span>
                      </div>
                      <h3 className="text-[20px] font-semibold text-on-surface">{seg.label}</h3>
                    </div>
                    <span className={`text-[14px] font-semibold px-2 py-1 rounded-full ${seg.badgeCls}`}>
                      {seg.badge}
                    </span>
                  </div>

                  <p className="text-[16px] text-on-surface-variant mb-6 flex-1">{seg.description}</p>

                  <div className="border-t border-surface-variant pt-4 grid grid-cols-3 gap-2">
                    {[
                      { key: 'recency',   label: 'Recency',   unit: 'd' },
                      { key: 'frequency', label: 'Frequency', unit: 'x' },
                      { key: 'monetary',  label: 'Monetary',  unit: '' },
                    ].map(({ key, label, unit }) => (
                      <div key={key}>
                        <span className="block text-[12px] text-on-surface-variant">{label}</span>
                        <span className="text-[16px] font-semibold text-on-surface">
                          {key === 'monetary'
                            ? `$${Number(seg[key]).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                            : `${seg[key]}${unit}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-surface-variant pt-4 flex justify-between items-center mt-4">
                    <div>
                      <span className="block text-[12px] text-on-surface-variant">Customers</span>
                      <span className="text-[20px] font-semibold text-on-surface">
                        {seg.customers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

import React from 'react'

// Composant de graphique en barres simple
export const SimpleBarChart = ({ data, title, color = '#3b82f6' }) => {
  if (!data || Object.keys(data).length === 0) return null

  const maxValue = Math.max(...Object.values(data))
  const entries = Object.entries(data).slice(0, 10) // Limiter à 10 éléments

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map(([key, value], index) => {
          const percentage = (value / maxValue) * 100
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 truncate">{key}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                  {value}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Composant de graphique en secteurs simple
export const SimplePieChart = ({ data, title }) => {
  if (!data || Object.keys(data).length === 0) return null

  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  
  const entries = Object.entries(data).map(([key, value], index) => ({
    name: key,
    value,
    percentage: ((value / total) * 100).toFixed(1),
    color: colors[index % colors.length]
  }))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(({ name, value, percentage, color }) => (
          <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{name}</div>
              <div className="text-xs text-gray-600">{value} ({percentage}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant de graphique linéaire simple
export const SimpleLineChart = ({ data, title, color = '#3b82f6' }) => {
  if (!data || Object.keys(data).length === 0) return null

  const entries = Object.entries(data)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-7) // Derniers 7 jours

  const maxValue = Math.max(...entries.map(([, value]) => value))
  const minValue = Math.min(...entries.map(([, value]) => value))
  const range = maxValue - minValue

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative h-48 bg-gray-50 rounded-lg p-4">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Zone remplie */}
          <path
            d={`M 0,${200 - ((entries[0][1] - minValue) / range) * 160} ${entries.map(([, value], index) => 
              `L ${(index / (entries.length - 1)) * 100}%,${200 - ((value - minValue) / range) * 160}`
            ).join(' ')} L 100%,200 L 0,200 Z`}
            fill="url(#gradient)"
          />
          
          {/* Ligne */}
          <path
            d={`M 0,${200 - ((entries[0][1] - minValue) / range) * 160} ${entries.map(([, value], index) => 
              `L ${(index / (entries.length - 1)) * 100}%,${200 - ((value - minValue) / range) * 160}`
            ).join(' ')}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Points */}
          {entries.map(([, value], index) => (
            <circle
              key={index}
              cx={`${(index / (entries.length - 1)) * 100}%`}
              cy={200 - ((value - minValue) / range) * 160}
              r="4"
              fill={color}
            />
          ))}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
          {entries.map(([date], index) => (
            <span key={index}>
              {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

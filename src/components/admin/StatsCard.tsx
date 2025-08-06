/**
 * Stats Card Component
 * Displays statistics with icons and change indicators
 */

import { ForwardRefExoticComponent, SVGProps } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface StatsCardProps {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement>>
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red'
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
}

const changeColorMap = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-600'
}

export const StatsCard = ({
  name,
  value,
  change,
  changeType,
  icon: Icon,
  color
}: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'positive' && (
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
            )}
            {changeType === 'negative' && (
              <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${changeColorMap[changeType]}`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
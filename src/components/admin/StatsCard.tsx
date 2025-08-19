/**
 * Stats Card Component
 * Displays statistics with icons and change indicators
 */

import { ForwardRefExoticComponent, SVGProps } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const changeColorMap = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-600',
};

export const StatsCard = ({
  name,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: StatsCardProps) => {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600'>{name}</p>
          <p className='mt-2 text-3xl font-bold text-gray-900'>{value}</p>
          <div className='mt-2 flex items-center'>
            {changeType === 'positive' && (
              <ArrowUpIcon className='mr-1 h-4 w-4 text-green-500' />
            )}
            {changeType === 'negative' && (
              <ArrowDownIcon className='mr-1 h-4 w-4 text-red-500' />
            )}
            <span className={`text-sm ${changeColorMap[changeType]}`}>{change}</span>
          </div>
        </div>
        <div className={`rounded-full p-3 ${colorMap[color]}`}>
          <Icon className='h-6 w-6 text-white' />
        </div>
      </div>
    </div>
  );
};

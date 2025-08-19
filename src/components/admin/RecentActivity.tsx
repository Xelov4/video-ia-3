/**
 * Recent Activity Component
 * Shows recent tools and activity feed
 */

import Link from 'next/link';
import Image from 'next/image';
import { DatabaseTool } from '@/src/lib/database/services/tools';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

interface RecentActivityProps {
  recentTools: DatabaseTool[];
}

export const RecentActivity = ({ recentTools }: RecentActivityProps) => {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>Activité récente</h3>
        <Link href='/admin/tools' className='text-sm text-blue-600 hover:text-blue-500'>
          Voir tout
        </Link>
      </div>

      <div className='space-y-4'>
        {recentTools.length > 0 ? (
          recentTools.map(tool => (
            <div
              key={tool.id}
              className='flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50'
            >
              {/* Tool Image */}
              <div className='flex-shrink-0'>
                {tool.image_url ? (
                  <Image
                    src={tool.image_url}
                    alt={tool.tool_name}
                    width={40}
                    height={40}
                    className='rounded-lg object-cover'
                  />
                ) : (
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                    <span className='text-sm font-semibold text-white'>
                      {tool.tool_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tool Info */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between'>
                  <p className='truncate text-sm font-medium text-gray-900'>
                    {tool.tool_name}
                  </p>
                  <div className='ml-2 flex items-center text-xs text-gray-500'>
                    <EyeIcon className='mr-1 h-3 w-3' />
                    {tool.view_count || 0}
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='truncate text-xs text-blue-600'>{tool.tool_category}</p>
                  <div className='ml-2 flex items-center text-xs text-gray-500'>
                    <ClockIcon className='mr-1 h-3 w-3' />
                    {new Date(tool.created_at).toLocaleDateString('fr')}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className='flex-shrink-0'>
                <Link
                  href={`/admin/tools/${tool.id}`}
                  className='text-sm text-blue-600 hover:text-blue-500'
                >
                  Modifier
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className='py-8 text-center text-gray-500'>
            <ClockIcon className='mx-auto mb-4 h-12 w-12 text-gray-300' />
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Recent Activity Component
 * Shows recent tools and activity feed
 */

import Link from 'next/link'
import Image from 'next/image'
import { DatabaseTool } from '@/src/lib/database/services/tools'
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline'

interface RecentActivityProps {
  recentTools: DatabaseTool[]
}

export const RecentActivity = ({ recentTools }: RecentActivityProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Activité récente
        </h3>
        <Link
          href="/admin/tools"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Voir tout
        </Link>
      </div>

      <div className="space-y-4">
        {recentTools.length > 0 ? (
          recentTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Tool Image */}
              <div className="flex-shrink-0">
                {tool.image_url ? (
                  <Image
                    src={tool.image_url}
                    alt={tool.tool_name}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {tool.tool_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tool Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tool.tool_name}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 ml-2">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {tool.view_count || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-600 truncate">
                    {tool.tool_category}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 ml-2">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {new Date(tool.created_at).toLocaleDateString('fr')}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <Link
                  href={`/admin/tools/${tool.id}`}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Modifier
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  )
}
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ActivityItemProps {
  type: string;
  message: string;
  time: string;
  icon: LucideIcon;
  iconColor?: string;
  href?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const ActivityItem = ({
  type,
  message,
  time,
  icon: Icon,
  iconColor = 'bg-gray-100 text-gray-600',
  href,
  user,
}: ActivityItemProps) => {
  const content = (
    <div className="flex items-start gap-3 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">
      <div className={`p-2 rounded-lg flex-shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {user && <span className="font-medium">{user.name} </span>}
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

// Activity type color presets
export const ActivityColors = {
  order: 'bg-blue-100 text-blue-600',
  user: 'bg-green-100 text-green-600',
  product: 'bg-yellow-100 text-yellow-600',
  payment: 'bg-emerald-100 text-emerald-600',
  refund: 'bg-red-100 text-red-600',
  review: 'bg-purple-100 text-purple-600',
  system: 'bg-gray-100 text-gray-600',
  alert: 'bg-orange-100 text-orange-600',
};

// Activity feed container component
interface ActivityFeedProps {
  title?: string;
  activities: ActivityItemProps[];
  maxItems?: number;
  viewAllHref?: string;
}

export const ActivityFeed = ({
  title = 'Recent Activity',
  activities,
  maxItems = 10,
  viewAllHref,
}: ActivityFeedProps) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        )}
      </div>
      <div className="divide-y">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

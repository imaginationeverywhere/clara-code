import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  href: string;
  count?: number;
  urgent?: boolean;
}

export const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  iconColor = 'bg-purple-100 text-purple-600',
  href,
  count,
  urgent = false,
}: QuickActionCardProps) => (
  <Link
    href={href}
    className={`block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all hover:border-blue-200 ${
      urgent ? 'border-red-200 bg-red-50' : ''
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {count !== undefined && count > 0 && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                urgent
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

// Preset configurations for common quick actions
export const QuickActionPresets = {
  pendingOrders: {
    title: 'Pending Orders',
    description: 'Review and process new orders',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  lowStock: {
    title: 'Low Stock Alerts',
    description: 'Products needing attention',
    iconColor: 'bg-red-100 text-red-600',
    urgent: true,
  },
  newCustomers: {
    title: 'New Customers',
    description: 'Welcome new signups',
    iconColor: 'bg-green-100 text-green-600',
  },
  pendingReviews: {
    title: 'Pending Reviews',
    description: 'Moderate customer reviews',
    iconColor: 'bg-yellow-100 text-yellow-600',
  },
  supportTickets: {
    title: 'Support Tickets',
    description: 'Respond to customer inquiries',
    iconColor: 'bg-purple-100 text-purple-600',
  },
  scheduledTasks: {
    title: 'Scheduled Tasks',
    description: 'Upcoming automated tasks',
    iconColor: 'bg-gray-100 text-gray-600',
  },
};

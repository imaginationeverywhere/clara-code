import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  growth?: number;
  period?: string;
  icon: LucideIcon;
  iconColor?: string;
  valuePrefix?: string;
  href?: string;
}

export const StatCard = ({
  title,
  value,
  growth,
  period,
  icon: Icon,
  iconColor = 'bg-blue-100 text-blue-600',
  valuePrefix = '',
  href,
}: StatCardProps) => {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        {growth !== undefined && (
          <span
            className={`text-sm font-medium ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {growth >= 0 ? '+' : ''}
            {growth}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {valuePrefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {period && <p className="text-xs text-gray-400 mt-1">{period}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

// Preset color configurations for common stat types
export const StatCardColors = {
  revenue: 'bg-green-100 text-green-600',
  orders: 'bg-blue-100 text-blue-600',
  users: 'bg-purple-100 text-purple-600',
  products: 'bg-yellow-100 text-yellow-600',
  growth: 'bg-emerald-100 text-emerald-600',
  alerts: 'bg-red-100 text-red-600',
  pending: 'bg-orange-100 text-orange-600',
  neutral: 'bg-gray-100 text-gray-600',
};

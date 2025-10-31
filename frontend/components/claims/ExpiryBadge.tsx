"use client";

interface ExpiryBadgeProps {
  endDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ExpiryBadge({ endDate, size = 'md' }: ExpiryBadgeProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getExpiryConfig = () => {
    if (!endDate) {
      return {
        className: 'text-gray-500',
      };
    }

    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        className: 'text-red-600',
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        className: 'text-orange-600',
      };
    } else {
      return {
        className: 'text-green-600',
      };
    }
  };

  const { className } = getExpiryConfig();

  return (
    <span className={`text-sm ${className}`}>
      {endDate ? formatDate(endDate) : '-'}
    </span>
  );
}


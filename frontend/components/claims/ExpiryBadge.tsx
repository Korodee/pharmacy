"use client";

interface ExpiryBadgeProps {
  endDate: string;
  size?: 'sm' | 'md' | 'lg';
  indefinite?: boolean;
}

export default function ExpiryBadge({ endDate, size = 'md', indefinite = false }: ExpiryBadgeProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const getExpiryConfig = () => {
    if (indefinite) {
      return {
        className: 'text-green-700',
        label: 'Indefinite',
      };
    }
    if (!endDate) {
      return {
        className: 'text-gray-500',
        label: '-',
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

  const { className, label } = getExpiryConfig();

  return (
    <span className={`text-sm ${className}`}>
      {indefinite ? 'Indefinite' : endDate ? formatDate(endDate) : (label || '-')}
    </span>
  );
}


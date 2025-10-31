"use client";

interface TypeBadgeProps {
  type: 'new' | 'renewal' | 'prior-authorization';
  size?: 'sm' | 'md' | 'lg';
}

export default function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'new':
        return {
          label: 'New',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'renewal':
        return {
          label: 'Renewal',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'prior-authorization':
        return {
          label: 'Prior Authorization',
          className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        };
      default:
        return {
          label: type,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-4 py-1.5 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const { label, className } = getTypeConfig();

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${className} ${getSizeClass()}`}
    >
      {label}
    </span>
  );
}


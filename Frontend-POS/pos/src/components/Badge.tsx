import React from 'react';

export type BadgeVariant =
  | 'green'
  | 'amber'
  | 'red'
  | 'gray'
  | 'pos'
  | 'ecommerce'
  | 'role-admin'
  | 'role-cajero'
  | 'role-bodeguero'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  className = '',
  dot = false,
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700';

  switch (variant) {
    case 'green':
    case 'success':
      styleClasses = 'bg-[#EAF8F0] text-[#1E9E60] font-medium';
      break;
    case 'amber':
    case 'warning':
      styleClasses = 'bg-[#FEF6E6] text-[#D98204] font-medium';
      break;
    case 'red':
    case 'danger':
      styleClasses = 'bg-[#FDECEB] text-[#E03B31] font-medium';
      break;
    case 'gray':
    case 'neutral':
      styleClasses = 'bg-[#F4F4F6] text-[#6C757D] font-medium';
      break;
    case 'info':
      styleClasses = 'bg-blue-50 text-blue-700 font-medium';
      break;
    case 'pos':
      styleClasses = 'bg-[#FFEFE6] text-[#FF6A1A] font-bold';
      break;
    case 'ecommerce':
      styleClasses = 'bg-[#FFF6D6] text-[#B87B00] font-bold';
      break;
    case 'role-admin':
      styleClasses = 'bg-[#FFEFE6] text-[#FF6A1A] font-semibold';
      break;
    case 'role-cajero':
      styleClasses = 'bg-[#FFEFE6] text-[#FF6A1A] font-semibold';
      break;
    case 'role-bodeguero':
      styleClasses = 'bg-[#FEF6E6] text-[#D98204] font-semibold';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${styleClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'green'
              ? 'bg-[#1E9E60]'
              : variant === 'amber'
              ? 'bg-[#D98204]'
              : variant === 'red'
              ? 'bg-[#E03B31]'
              : 'bg-current'
          }`}
        />
      )}
      {children}
    </span>
  );
};

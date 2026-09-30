'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badges,
  actions,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {badges}
        {actions}
      </div>
    </header>
  );
};

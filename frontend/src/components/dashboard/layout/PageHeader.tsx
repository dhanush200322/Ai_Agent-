'use client';

import React from 'react';
import { Breadcrumb } from './Breadcrumb';


interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
      <div className="space-y-1.5">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
}

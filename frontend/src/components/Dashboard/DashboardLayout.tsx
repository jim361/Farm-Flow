// src/components/Dashboard/DashboardLayout.tsx

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: LayoutProps) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      {children}
    </div>
  );
};

export default DashboardLayout;

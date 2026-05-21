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
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px',
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      {children}
    </div>
  );
};

export default DashboardLayout;

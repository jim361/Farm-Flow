// src/components/Dashboard/DashboardLayout.tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: LayoutProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      width: '100%',
      alignItems: 'stretch'
    }}>
      {children}
    </div>
  );
};

export default DashboardLayout;

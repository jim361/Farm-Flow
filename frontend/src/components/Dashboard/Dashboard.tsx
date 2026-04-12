// src/components/Dashboard/Dashboard.tsx

import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

const DashboardCard = ({ title, children }: DashboardCardProps) => {
  return (
    <div style={{
      flex: 1,
      border: '1px solid #000',
      padding: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;

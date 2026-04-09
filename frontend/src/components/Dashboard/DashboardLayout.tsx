// src/components/Dashboard/DashboardLayout.tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: LayoutProps) => {
  return (
    <div style={{ 
      display: 'flex',       // 가로 정렬의 핵심!
      flexDirection: 'row',  // 가로 방향으로
      gap: '20px',           // 네모칸 사이 간격
      width: '100%',         // 전체 너비 사용
      alignItems: 'stretch'  // 카드들의 높이를 똑같이 맞춤
    }}>
      {children}
    </div>
  );
};

export default DashboardLayout;
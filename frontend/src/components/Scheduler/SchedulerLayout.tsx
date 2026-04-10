// src/components/Scheduler/SchedulerLayout.tsx

import React from 'react';

interface Props {
  left: React.ReactNode;   // 왼쪽 컬럼 (캘린더 + 타임라인)
  right: React.ReactNode;  // 오른쪽 컬럼 (오늘의 일정)
}

const SchedulerLayout = ({ left, right }: Props) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '20px', 
      alignItems: 'stretch', // 높이 맞춤
      width: '100%' 
    }}>
      {/* 왼쪽 컬럼 바구니 (비율 2.5) */}
      <div style={{ 
        flex: 2.5, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
      }}>
        {left}
      </div>

      {/* 오른쪽 컬럼 바구니 (비율 1) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {right}
      </div>
    </div>
  );
};

export default SchedulerLayout;
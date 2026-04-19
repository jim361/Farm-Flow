// 역할: 캘린더/타임라인(좌측)과 할 일 패널(우측)을 2단 레이아웃으로 배치하는 컴포넌트입니다.

import React from 'react';

interface Props {
  left: React.ReactNode;   // 왼쪽 컬럼 (캘린더 + 타임라인)
  right?: React.ReactNode;  // 오른쪽 컬럼 (오늘의 일정)
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

      {right ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
};

export default SchedulerLayout;
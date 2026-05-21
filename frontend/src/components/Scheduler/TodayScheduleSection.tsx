// src/components/Scheduler/TodayScheduleSection.tsx

import DashboardCard from "../Dashboard/Dashboard";

const TodayScheduleSection = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <DashboardCard title="오늘의 일정 (총 4건)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>기본 환기 시스템</div>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>영양액 자동 공급</div>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>LED 인공 광원</div>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>야간 온도 조절</div>
          <div style={{ flex: 1 }}></div> 
        </div>
      </DashboardCard>
    </div>
  );
};

export default TodayScheduleSection;
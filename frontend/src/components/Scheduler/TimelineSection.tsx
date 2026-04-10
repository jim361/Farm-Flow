// src/components/Scheduler/TimelineSection.tsx

import DashboardCard from "../Dashboard/Dashboard";

const TimelineSection = () => {
  return (
      <DashboardCard title="24시간 타임라인 (05월 03일)">
        <div style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
          타임라인 차트 영역
        </div>
      </DashboardCard>
  );
};

export default TimelineSection;
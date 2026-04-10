// src/components/Scheduler/CalendarSection.tsx

import DashboardCard from "../Dashboard/Dashboard";

const CalendarSection = () => {
  return (
      <DashboardCard title="2024년 5월">
        <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
          캘린더 영역
        </div>
      </DashboardCard>
  );
};

export default CalendarSection;
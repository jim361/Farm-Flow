// src/components/Dsahboard/CalendarSection.tsx
import DashboardCard from "./Dashboard";

const CalendarSection = () => {
  return (
    <div style={{ flex: 1 }}>
      <h3 style={{ margin: '0 0 10px 5px' }}>캘린더</h3>
      <DashboardCard title=" ">
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
          캘린더 제작할 예정
        </div>
      </DashboardCard>
    </div>
  );
};

export default CalendarSection;
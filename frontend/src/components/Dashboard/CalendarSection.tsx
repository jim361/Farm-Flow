// src/components/Dashboard/CalendarSection.tsx
import DashboardCard from './Dashboard';

const CalendarSection = () => {
  return (
    <div style={{ flex: 1 }}>
      <h3 style={{ margin: '0 0 10px 5px' }}>캘린더</h3>
      <DashboardCard title="">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          border: '1px dashed #ccc'
        }}>
          <p>캘린더 제작할 예정</p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default CalendarSection;

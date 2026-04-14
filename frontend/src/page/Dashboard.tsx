// src/page/Dashboard.tsx

import WeatherSection from '../components/Dashboard/WeatherSection';
import MetricsSection from '../components/Dashboard/MetricsSection';
import CalendarSection from '../components/Dashboard/CalendarSection';
import WorkflowSection from '../components/Dashboard/WorkflowSection';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <WeatherSection />
      <h2>대시보드 현황</h2>
      <MetricsSection />
      <div style={{ display: 'flex', gap: '20px' }}>
        <CalendarSection />
        <WorkflowSection />
      </div>
    </div>
  );
}

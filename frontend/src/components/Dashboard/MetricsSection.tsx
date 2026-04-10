// src/componentsDsahboard//MetricsSection.tsx

import DashboardCard from './Dashboard';
import DashboardLayout from './DashboardLayout';

const MetricsSection = () => {
  return (
    <DashboardLayout>
      <DashboardCard title="온도"> <p>온도</p> </DashboardCard>
      <DashboardCard title="습도"> <p>습도</p> </DashboardCard>
      <DashboardCard title="CO2"> <p>CO2</p> </DashboardCard>
      <DashboardCard title="조도"> <p>조도</p> </DashboardCard>
    </DashboardLayout>
  );
};

export default MetricsSection;
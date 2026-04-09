// src/components/Dsahboard/WorkflowSection.tsx
import DashboardCard from "./Dashboard";

const WorkflowSection = () => {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: '0 0 10px 5px' }}>활성 워크플로우</h3>
        <DashboardCard title="지능형 환기 로직">
          <p>워크플로우1</p>
        </DashboardCard>
        <DashboardCard title="정밀 관수 시스템">
          <p>워크플로우2</p>
        </DashboardCard>
        <DashboardCard title="자동 양맥 조절기">
          <p>워크플로우3</p>
        </DashboardCard>
      </div>
    </div>
  );
};

export default WorkflowSection;
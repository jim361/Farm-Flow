import DashboardCard from "./Dashboard";
import { activeWorkflows } from './mockDashboardDb';

const WorkflowSection = () => {
  return (
    <DashboardCard title="활성 워크플로우" subtitle="실행 상태 요약">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              border: '1px solid #d9e7cf',
              borderRadius: '12px',
              backgroundColor: '#f9fcf6',
            }}
          >
            <div>
              <strong style={{ color: '#2f5124' }}>{workflow.name}</strong>
              <p style={{ margin: '4px 0 0', color: '#667560', fontSize: '12px' }}>{workflow.updatedAt}</p>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: workflow.status === 'ACTIVE' ? '#2f6b2f' : '#8a5a22',
                backgroundColor: workflow.status === 'ACTIVE' ? '#e3f6df' : '#fff1e2',
                borderRadius: '999px',
                padding: '4px 10px',
              }}
            >
              {workflow.status}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default WorkflowSection;
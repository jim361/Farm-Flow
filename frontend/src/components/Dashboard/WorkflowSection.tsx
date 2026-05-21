import DashboardCard from "./Dashboard";
import { activeWorkflows } from './mockDashboardDb';

const WorkflowSection = () => {
  return (
    <DashboardCard title="활성 워크플로우" subtitle="실행 상태 요약">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {activeWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '11px 12px',
              minHeight: '44px',
              border: '1px solid #e6e9f2',
              borderRadius: '10px',
              backgroundColor: '#fbfcff',
            }}
          >
            <div>
              <strong style={{ color: '#222939', fontSize: '13px' }}>{workflow.name}</strong>
              <p style={{ margin: '3px 0 0', color: '#6e748a', fontSize: '12px' }}>{workflow.updatedAt}</p>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: workflow.status === 'ACTIVE' ? '#2f6b2f' : '#8a5a22',
                backgroundColor: workflow.status === 'ACTIVE' ? '#e7f8e8' : '#fff3e6',
                borderRadius: '999px',
                padding: '3px 9px',
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
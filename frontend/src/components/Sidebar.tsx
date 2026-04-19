// 역할: 실시간 일정 알림을 보여주는 사이드바 알림센터 컴포넌트입니다.

interface ScheduleAlert {
  id: string;
  message: string;
  timeLabel: string;
}

interface SidebarProps {
  alerts: ScheduleAlert[];
}

export default function Sidebar({ alerts }: SidebarProps){
  return(
    <aside style={{ width: '280px', backgroundColor: '#eef3ee', padding: '20px 16px', borderRight: '1px solid #d9e2da' }}>
      <h2 style={{ margin: '0 0 4px', color: '#22412d' }}>Farm Flow</h2>
      <p style={{ margin: '0 0 14px', color: '#5d6f62', fontSize: '13px' }}>알림센터</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 ? (
          <p style={{ margin: 0, color: '#7b8a7f', fontSize: '12px' }}>현재 예정된 알림이 없습니다.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                border: '1px solid #d3ddd5',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                padding: '10px',
              }}
            >
              <strong style={{ display: 'block', color: '#2a4d34', fontSize: '12px' }}>{alert.timeLabel}</strong>
              <p style={{ margin: '4px 0 0', color: '#3d5243', fontSize: '12px', lineHeight: 1.4 }}>{alert.message}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
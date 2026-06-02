// 역할: 실시간 일정 알림을 보여주는 사이드바 알림센터 컴포넌트입니다.

interface ScheduleAlert {
  id: string;
  title?: string;
  message: string;
  timeLabel: string;
  source?: string;
  command?: string;
}

interface SidebarProps {
  alerts: ScheduleAlert[];
  onClose?: () => void;
  onDismiss?: (alert: ScheduleAlert) => void;
}

export default function Sidebar({ alerts, onClose, onDismiss }: SidebarProps){
  return(
    <aside style={{ width: '280px', backgroundColor: '#eef3ee', padding: '20px 16px', borderRight: '1px solid #d9e2da' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: '#22412d' }}>Farm Flow</h2>
          <p style={{ margin: '0 0 14px', color: '#5d6f62', fontSize: '13px' }}>알림센터</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="알림센터 닫기"
          style={{
            width: '30px',
            height: '30px',
            border: '1px solid #d3ddd5',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#47614f',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          ×
        </button>
      </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                <strong style={{ display: 'block', color: '#2a4d34', fontSize: '12px' }}>{alert.title || alert.timeLabel}</strong>
                {alert.command && (
                  <span
                    style={{
                      borderRadius: '999px',
                      background: alert.command === 'ON' ? '#dcfce7' : '#fee2e2',
                      color: alert.command === 'ON' ? '#166534' : '#991b1b',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {alert.command}
                  </span>
                )}
              </div>
              <small style={{ display: 'block', marginTop: '3px', color: '#708075', fontSize: '11px' }}>
                {alert.timeLabel}{alert.source ? ` · ${alert.source}` : ''}
              </small>
              <p style={{ margin: '4px 0 0', color: '#3d5243', fontSize: '12px', lineHeight: 1.4 }}>{alert.message}</p>
              {onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(alert)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    border: '1px solid #c7d7cc',
                    borderRadius: '8px',
                    background: '#f8fbf8',
                    color: '#2f5a3b',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '6px 8px',
                  }}
                >
                  확인
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

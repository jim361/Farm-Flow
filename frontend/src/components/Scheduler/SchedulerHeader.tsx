// 역할: 스케줄러 페이지 상단 타이틀과 주요 액션 버튼을 담당하는 헤더 컴포넌트입니다.

interface Props {
  onAddClick?: () => void;
  onMockAlertClick?: () => void;
}

const SchedulerHeader = ({ onAddClick, onMockAlertClick }: Props) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 2px 2px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>스케줄러 관리</h2>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', maxWidth: '560px', fontSize: '0.92rem', lineHeight: 1.5 }}>온실 자동화 일정 및 하드웨어 가동 시간을 최적화합니다.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {onMockAlertClick ? (
          <button
            onClick={onMockAlertClick}
            style={{
              backgroundColor: '#f1f4f9',
              color: '#334155',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #dce3ee',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            알림 테스트 일정
          </button>
        ) : null}

        {onAddClick ? (
          <button
            type="button"
            className="ff-btn-save"
            onClick={onAddClick}
          >
            + 새 일정 추가
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SchedulerHeader;
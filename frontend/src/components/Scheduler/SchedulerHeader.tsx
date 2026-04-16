// 역할: 스케줄러 페이지 상단 타이틀과 주요 액션 버튼을 담당하는 헤더 컴포넌트입니다.

interface Props {
  onAddClick?: () => void;
  onMockAlertClick?: () => void;
}

const SchedulerHeader = ({ onAddClick, onMockAlertClick }: Props) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: 0 }}>스케줄러 관리</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>온실 자동화 일정 및 하드웨어 가동 시간을 최적화합니다.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {onMockAlertClick ? (
          <button
            onClick={onMockAlertClick}
            style={{
              backgroundColor: '#e8f3ea',
              color: '#275138',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #c8ddcc',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            알림 테스트 일정
          </button>
        ) : null}

        {onAddClick ? (
          <button
            onClick={onAddClick}
            style={{
              backgroundColor: '#1f6d40',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            + 새 일정 추가
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SchedulerHeader;
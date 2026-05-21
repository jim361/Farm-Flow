import { useNavigate } from 'react-router-dom';
import DashboardCard from './Dashboard';

const CalendarSection = () => {
  const navigate = useNavigate();

  // 한글 주석: 캘린더 영역과 오늘 할 일 영역 모두 동일한 스케줄러 페이지로 이동시킵니다.
  const moveToSchedular = () => {
    navigate('/scheduler')
  };

  // 한글 주석: 키보드 접근성(Enter/Space)으로도 동일 이동 이벤트가 실행되도록 처리합니다.
  const handleKeyboardMove = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      moveToSchedular();
    }
  };

  return (
    <DashboardCard title="캘린더 (Calendar)">
      <div
        role="button"
        tabIndex={0}
        onClick={moveToSchedular}
        onKeyDown={handleKeyboardMove}
        style={{
          border: '1px solid #e6e8f0',
          backgroundColor: '#f8f9fd',
          borderRadius: '14px',
          padding: '14px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '7px' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <strong key={day} style={{ color: '#8a8fa2', textAlign: 'center', fontSize: '13px' }}>
              {day}
            </strong>
          ))}
          {Array.from({ length: 35 }, (_, index) => {
            const dayNumber = index - 1;
            const isInMonth = dayNumber >= 1 && dayNumber <= 30;
            const isToday = dayNumber === 12;

            return (
              <div
                key={`day-${index}`}
                style={{
                  height: '32px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  color: isInMonth ? '#3a4054' : '#a2a8bc',
                  backgroundColor: isToday ? '#e8f7e9' : '#ffffff',
                  border: '1px solid #e6e8f0',
                }}
              >
                {isInMonth ? dayNumber : ''}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
};

export default CalendarSection;

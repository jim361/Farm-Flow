import { useNavigate } from 'react-router-dom';
import DashboardCard from './Dashboard';

const CalendarSection = () => {
  const navigate = useNavigate();

  // 한글 주석: 캘린더 영역과 오늘 할 일 영역 모두 동일한 스케줄러 페이지로 이동시킵니다.
  const moveToSchedular = () => {
    navigate('/Schedular');
  };

  // 한글 주석: 키보드 접근성(Enter/Space)으로도 동일 이동 이벤트가 실행되도록 처리합니다.
  const handleKeyboardMove = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      moveToSchedular();
    }
  };

  return (
    <DashboardCard title="캘린더 (Calendar)" subtitle="클릭 시 스케줄러로 이동">
      <div
        role="button"
        tabIndex={0}
        onClick={moveToSchedular}
        onKeyDown={handleKeyboardMove}
        style={{
          border: '1px solid #d9e7cf',
          backgroundColor: '#f9fcf6',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <strong key={day} style={{ color: '#5d6f56', textAlign: 'center', fontSize: '12px' }}>
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
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: isInMonth ? '#41563a' : '#9bad96',
                  backgroundColor: isToday ? '#dff1d5' : '#ffffff',
                  border: '1px solid #e2eed9',
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
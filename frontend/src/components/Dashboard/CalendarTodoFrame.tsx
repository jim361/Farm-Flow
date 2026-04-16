// 역할: Dashboard에서 캘린더와 오늘의 할 일을 단일 프레임으로 통합 표시하는 컴포넌트입니다.

import DashboardCard from './Dashboard';
import type { ScheduleEventItem } from '../Scheduler/types';

interface CalendarTodoFrameProps {
  todayDate: string;
  todayEvents: ScheduleEventItem[];
  completedEventIds: string[];
  onToggleComplete: (eventId: string) => void;
  onOpenEditModal: (eventId: string) => void;
  onCalendarClick?: () => void;
}

const CalendarTodoFrame = ({
  todayDate,
  todayEvents,
  completedEventIds,
  onToggleComplete,
  onOpenEditModal,
  onCalendarClick,
}: CalendarTodoFrameProps) => {
  const handleCalendarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onCalendarClick) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCalendarClick();
    }
  };

  return (
    <DashboardCard title="캘린더">
      {/* 한글 주석: 상단 캘린더 영역 */}
      <div
        role={onCalendarClick ? 'button' : undefined}
        tabIndex={onCalendarClick ? 0 : undefined}
        onClick={onCalendarClick}
        onKeyDown={handleCalendarKeyDown}
        style={{
          border: '1px solid #d9e7cf',
          backgroundColor: '#f9fcf6',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px',
          cursor: onCalendarClick ? 'pointer' : 'default',
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
            const isToday = dayNumber === 13;

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

      {/* 한글 주석: 하단 오늘의 할 일 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <h4 style={{ margin: 0, color: '#2f5124' }}>오늘의 할 일 (To-do) - {todayDate}</h4>
        {todayEvents.length === 0 ? (
          <p style={{ margin: 0, color: '#768278', fontSize: '13px' }}>오늘 등록된 일정이 없습니다.</p>
        ) : (
          todayEvents.map((event) => {
            const isDone = completedEventIds.includes(event.id);

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onOpenEditModal(event.id)}
                style={{
                  border: '1px solid #dbe7dc',
                  borderRadius: '10px',
                  backgroundColor: '#f9fcf9',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onClick={(checkboxEvent) => checkboxEvent.stopPropagation()}
                    onChange={() => onToggleComplete(event.id)}
                    style={{ width: '15px', height: '15px', accentColor: '#2f6f46' }}
                  />
                  <div>
                    <strong style={{ color: '#304235', fontSize: '13px', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {event.title}
                    </strong>
                    <p style={{ margin: '3px 0 0', color: '#5e6f63', fontSize: '12px' }}>
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
                <span style={{ color: '#66756c', fontSize: '12px', fontWeight: 700 }}>수정</span>
              </button>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
};

export default CalendarTodoFrame;

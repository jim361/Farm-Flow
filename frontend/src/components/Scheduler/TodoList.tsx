// 역할: 오늘 날짜 일정 데이터를 기반으로 자동 노출되는 오늘의 할 일 목록 컴포넌트입니다.

import DashboardCard from '../Dashboard/Dashboard';
import type { ScheduleEventItem } from './types';

interface TodoListProps {
  todayDate: string;
  todayEvents: ScheduleEventItem[];
  completedEventIds: string[];
  onToggleComplete: (eventId: string) => void;
  onEventClick: (eventId: string) => void;
}

const TodoList = ({ todayDate, todayEvents, completedEventIds, onToggleComplete, onEventClick }: TodoListProps) => {
  return (
    <DashboardCard title="오늘의 할 일 (To-do)" subtitle={`${todayDate} 자동 동기화`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {todayEvents.length === 0 ? (
          <p style={{ margin: 0, color: '#768278', fontSize: '13px' }}>오늘 등록된 일정이 없어 표시할 할 일이 없습니다.</p>
        ) : (
          todayEvents.map((event) => (
            <div
              key={event.id}
              style={{
                border: '1px solid #dbe7dc',
                borderRadius: '10px',
                backgroundColor: '#f9fcf9',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => onToggleComplete(event.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#304235',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    backgroundColor: completedEventIds.includes(event.id) ? '#6bb287' : '#d8a15d',
                  }}
                />
                <span
                  style={{
                    textDecoration: completedEventIds.includes(event.id) ? 'line-through' : 'none',
                    fontSize: '13px',
                  }}
                >
                  {event.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onEventClick(event.id)}
                style={{
                  border: '1px solid #d4ddd5',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  backgroundColor: '#ffffff',
                  color: '#5e6a61',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                상세
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
};

export default TodoList;

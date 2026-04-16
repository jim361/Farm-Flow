// 역할: 오늘 일정 목록을 To-do 프레임으로 보여주고 완료 체크 및 수정 모달 진입을 제공하는 컴포넌트입니다.

import DashboardCard from '../Dashboard/Dashboard';
import type { ScheduleEventItem } from './types';

interface TodoSectionProps {
  todayDate: string;
  todayEvents: ScheduleEventItem[];
  completedEventIds: string[];
  onToggleComplete: (eventId: string) => void;
  onOpenEditModal: (eventId: string) => void;
}

const TodoSection = ({
  todayDate,
  todayEvents,
  completedEventIds,
  onToggleComplete,
  onOpenEditModal,
}: TodoSectionProps) => {
  return (
    <DashboardCard title="오늘의 할 일 (To-do)" subtitle={`${todayDate} 일정 자동 필터링`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', minHeight: '320px' }}>
        {todayEvents.length === 0 ? (
          <p style={{ margin: 0, color: '#7a897f', fontSize: '13px' }}>오늘 일정이 아직 없습니다.</p>
        ) : (
          todayEvents.map((event) => {
            const isDone = completedEventIds.includes(event.id);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onOpenEditModal(event.id)}
                style={{
                  border: '1px solid #d6e3d9',
                  borderRadius: '12px',
                  backgroundColor: isDone ? '#f1f7f2' : '#ffffff',
                  padding: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggleComplete(event.id)}
                    onClick={(checkboxEvent) => checkboxEvent.stopPropagation()}
                    style={{ width: '15px', height: '15px', accentColor: '#2f6f46', cursor: 'pointer' }}
                  />

                  <div>
                    <strong
                      style={{
                        color: '#2a4533',
                        fontSize: '14px',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {event.title}
                    </strong>
                    <p style={{ margin: '3px 0 0', color: '#6b786f', fontSize: '12px' }}>
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <span style={{ color: '#597264', fontSize: '12px', fontWeight: 700 }}>수정</span>
              </button>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
};

export default TodoSection;

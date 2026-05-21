// 역할: 오늘 일정 목록을 To-do 프레임으로 보여주고 완료 체크 및 수정 모달 진입을 제공하는 컴포넌트입니다.

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 4px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2a2f3b', fontSize: '1.5rem', lineHeight: 1.06, letterSpacing: '-0.02em' }}>오늘의 일정</h3>
          <p style={{ margin: '4px 0 0', color: '#6f768a', fontSize: '12px' }}>{todayDate}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-2px' }}>
          <span style={{ backgroundColor: '#dff2e2', color: '#2d5a3b', borderRadius: '999px', fontSize: '12px', fontWeight: 700, padding: '4px 10px' }}>
            총 {todayEvents.length}건
          </span>
        </div>
      </div>
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
                  border: '1px solid #eceef5',
                  borderRadius: '12px',
                  backgroundColor: isDone ? '#f0f4f1' : '#ffffff',
                  padding: '12px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '9px',
                      backgroundColor: '#edf0f0',
                      color: '#255139',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {event.category === '환기' ? '풍' : event.category === '관수' ? '수' : event.category === '조명' ? '광' : '점'}
                  </span>
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
                        color: '#243028',
                        fontSize: '16px',
                        textDecoration: isDone ? 'line-through' : 'none',
                        lineHeight: 1.08,
                      }}
                    >
                      {event.title}
                    </strong>
                    <p style={{ margin: '3px 0 0', color: '#1f6a3f', fontSize: '12px', fontWeight: 700 }}>
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <span style={{ color: '#667085', fontSize: '12px', fontWeight: 700 }}>상세</span>
              </button>
            );
          })
        )}
    </div>
  );
};

export default TodoSection;

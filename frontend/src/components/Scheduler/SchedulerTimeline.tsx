// 역할: 선택한 날짜의 일정 이벤트를 시간순으로 보여주는 타임라인 컴포넌트입니다.

import DashboardCard from '../Dashboard/Dashboard';
import type { ScheduleEventItem } from './types';

interface SchedulerTimelineProps {
  todayDate: string;
  events: ScheduleEventItem[];
  completedEventIds: string[];
  onToggleComplete: (eventId: string) => void;
  onEventClick: (eventId: string) => void;
}

const badgeColor = (category: ScheduleEventItem['category']) => {
  if (category === '환기') return '#c7eed6';
  if (category === '관수') return '#cfe7ff';
  if (category === '조명') return '#ffeabf';
  return '#e0e0e0';
};

const parseMinute = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const toPercent = (minute: number) => (minute / (24 * 60)) * 100;

const SchedulerTimeline = ({ todayDate, events, completedEventIds, onToggleComplete, onEventClick }: SchedulerTimelineProps) => {
  const dailyEvents = events
    .filter((event) => event.date === todayDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <DashboardCard title="통합 타임라인 프레임" subtitle={`${todayDate} | 일정 등록 → 진행 확인 → 알림 연동`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', color: '#6b796f', fontSize: '11px' }}>
          <span>00:00</span>
          <span style={{ textAlign: 'center' }}>06:00</span>
          <span style={{ textAlign: 'center' }}>12:00</span>
          <span style={{ textAlign: 'center' }}>18:00</span>
          <span style={{ textAlign: 'right' }}>24:00</span>
        </div>

        <div style={{ position: 'relative', height: '8px', borderRadius: '999px', backgroundColor: '#e7efe8' }}>
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c9d6cb' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c9d6cb' }} />
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c9d6cb' }} />
        </div>

        {dailyEvents.length === 0 ? (
          <p style={{ margin: 0, color: '#7a857b', fontSize: '13px' }}>등록된 일정이 없습니다.</p>
        ) : (
          dailyEvents.map((event) => {
            const isDone = completedEventIds.includes(event.id);
            return (
            <div
              key={event.id}
              style={{
                border: '1px solid #dbe7dc',
                borderRadius: '10px',
                backgroundColor: isDone ? '#f1f6f2' : '#f9fcf9',
                padding: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onToggleComplete(event.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '999px',
                      border: '1px solid #c1d6c6',
                      backgroundColor: isDone ? '#64a981' : '#ffffff',
                      color: '#ffffff',
                      fontSize: '11px',
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                    aria-label="완료 토글"
                  >
                    {isDone ? '✓' : ''}
                  </button>
                  <strong style={{ color: '#283b2d', fontSize: '14px', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {event.title}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => onEventClick(event.id)}
                  style={{
                    border: '1px solid #d5ded6',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#56655a',
                    fontSize: '12px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  수정/삭제
                </button>
              </div>

              <div style={{ position: 'relative', height: '16px', borderRadius: '999px', backgroundColor: '#edf3ee' }}>
                <div
                  title={event.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${toPercent(parseMinute(event.startTime))}%`,
                    width: `${Math.max(8, toPercent(parseMinute(event.endTime) - parseMinute(event.startTime)))}%`,
                    height: '16px',
                    borderRadius: '999px',
                    backgroundColor: isDone ? '#7cae8f' : '#3f8755',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </div>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, color: '#69756c', fontSize: '12px' }}>
                  {event.startTime} - {event.endTime}
                </p>
                <span
                  style={{
                    backgroundColor: badgeColor(event.category),
                    color: '#2f4634',
                    borderRadius: '999px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {event.category}
                </span>
              </div>
            </div>
          );
          })
        )}
      </div>
    </DashboardCard>
  );
};

export default SchedulerTimeline;

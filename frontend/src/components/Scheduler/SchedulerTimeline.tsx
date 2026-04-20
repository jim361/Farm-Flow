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
    <DashboardCard title={`24시간 타임라인 (${todayDate})`} subtitle={undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', color: '#5b6070', fontSize: '11px', fontWeight: 700 }}>
          <span>00:00</span>
          <span style={{ textAlign: 'center' }}>06:00</span>
          <span style={{ textAlign: 'center' }}>12:00</span>
          <span style={{ textAlign: 'center' }}>18:00</span>
          <span style={{ textAlign: 'right' }}>24:00</span>
        </div>

        <div style={{ position: 'relative', height: '8px', borderRadius: '999px', backgroundColor: '#e4e5f2' }}>
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c7cade' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c7cade' }} />
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', backgroundColor: '#c7cade' }} />
        </div>

        {dailyEvents.length === 0 ? (
          <p style={{ margin: 0, color: '#7a857b', fontSize: '13px' }}>등록된 일정이 없습니다.</p>
        ) : (
          <div style={{ position: 'relative', height: '62px', borderRadius: '12px', backgroundColor: '#eceaf5', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', backgroundColor: '#d6d4e4' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#d6d4e4' }} />
            <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', backgroundColor: '#d6d4e4' }} />

            {dailyEvents.map((event, index) => {
              const isDone = completedEventIds.includes(event.id);
              const laneTop = index % 2 === 0 ? 10 : 34;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick(event.id)}
                  style={{
                    position: 'absolute',
                    top: `${laneTop}px`,
                    left: `${toPercent(parseMinute(event.startTime))}%`,
                    width: `${Math.max(10, toPercent(parseMinute(event.endTime) - parseMinute(event.startTime)))}%`,
                    height: '18px',
                    border: 'none',
                    borderRadius: '999px',
                    backgroundColor: isDone ? '#7cae8f' : '#2f6f46',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    padding: '0 6px 0 8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={`${event.title} (${event.startTime} - ${event.endTime})`}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
                  <button
                    type="button"
                    aria-label="완료 토글"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(event.id);
                    }}
                    style={{
                      border: 'none',
                      padding: 0,
                      width: '10px',
                      height: '10px',
                      borderRadius: '999px',
                      backgroundColor: isDone ? '#d8f6e2' : badgeColor(event.category),
                      flex: '0 0 auto',
                      cursor: 'pointer',
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default SchedulerTimeline;

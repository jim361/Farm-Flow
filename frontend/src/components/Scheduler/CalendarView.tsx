// 역할: 날짜 선택과 일별 이벤트 개수 확인을 담당하는 월간 캘린더 UI 컴포넌트입니다.

import type { ScheduleEventItem } from './types';

interface CalendarViewProps {
  selectedDate: string;
  visibleDate: Date;
  eventsByDate: Record<string, ScheduleEventItem[]>;
  onSelectDate: (date: string) => void;
  onEventClick: (eventId: string) => void;
}

const weekdayLabel = ['일', '월', '화', '수', '목', '금', '토'];

const toDateString = (year: number, monthIndex: number, day: number) => {
  const month = String(monthIndex + 1).padStart(2, '0');
  const date = String(day).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

const CalendarView = ({ selectedDate, visibleDate, eventsByDate, onSelectDate, onEventClick }: CalendarViewProps) => {
  const year = visibleDate.getFullYear();
  const monthIndex = visibleDate.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  const leading = Array.from({ length: firstWeekday }, () => 0);
  const days = Array.from({ length: lastDay }, (_, idx) => idx + 1);
  const trailingLength = (7 - ((leading.length + days.length) % 7)) % 7;
  const trailing = Array.from({ length: trailingLength }, () => 0);
  const allCells = [...leading, ...days, ...trailing];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
        {weekdayLabel.map((label) => (
          <div key={label} style={{ textAlign: 'center', color: '#68756c', fontSize: '12px', fontWeight: 700 }}>
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
        {allCells.map((day, idx) => {
          if (day === 0) {
            return <div key={`empty-${idx}`} style={{ height: '72px', borderRadius: '10px', backgroundColor: '#f7faf7' }} />;
          }

          const cellDate = toDateString(year, monthIndex, day);
          const isSelected = selectedDate === cellDate;
          const events = eventsByDate[cellDate] ?? [];
          const count = events.length;

          return (
            <button
              key={cellDate}
              type="button"
              onClick={() => onSelectDate(cellDate)}
              style={{
                height: '72px',
                borderRadius: '10px',
                border: isSelected ? '1px solid #2d6b43' : '1px solid #d7e3d8',
                backgroundColor: isSelected ? '#e5f3e8' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '8px',
              }}
            >
              <span style={{ color: '#243628', fontWeight: 700, fontSize: '13px' }}>{day}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                <span style={{ color: '#2f6b43', fontSize: '11px' }}>{count > 0 ? `${count}건` : ''}</span>
                {events.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event.id);
                    }}
                    style={{
                      border: 'none',
                      borderRadius: '999px',
                      backgroundColor: '#dff1e3',
                      color: '#275138',
                      fontSize: '10px',
                      padding: '2px 6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

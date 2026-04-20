// 역할: 스케줄러의 월간 캘린더 카드와 일정 추가 진입 버튼을 제공하는 컴포넌트입니다.

import DashboardCard from '../Dashboard/Dashboard';
import CalendarView from './CalendarView';
import type { ScheduleEventItem } from './types';

interface CalendarSectionProps {
  selectedDate: string;
  visibleDate: Date;
  eventsByDate: Record<string, ScheduleEventItem[]>;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onEventClick: (eventId: string) => void;
}

const CalendarSection = ({
  selectedDate,
  visibleDate,
  eventsByDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onEventClick,
}: CalendarSectionProps) => {
  const monthLabel = `${visibleDate.getFullYear()}년 ${visibleDate.getMonth() + 1}월`;

  return (
    <DashboardCard title="캘린더" subtitle={undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ color: '#212530', fontSize: '36px', lineHeight: 1.06, letterSpacing: '-0.02em' }}>{monthLabel}</strong>
            <button
              type="button"
              onClick={onPrevMonth}
              style={{
                border: '1px solid #d8dae6',
                backgroundColor: '#f5f5fb',
                color: '#464e63',
                borderRadius: '999px',
                width: '28px',
                height: '28px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              style={{
                border: '1px solid #d8dae6',
                backgroundColor: '#f5f5fb',
                color: '#464e63',
                borderRadius: '999px',
                width: '28px',
                height: '28px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ›
            </button>
          </div>

          {/* <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#004d26', color: '#ffffff', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}>월간</span>
            <span style={{ color: '#3c4458', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 700 }}>주간</span>
            <span style={{ color: '#3c4458', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 700 }}>일간</span>
          </div> */}
        </div>

        <CalendarView
          selectedDate={selectedDate}
          visibleDate={visibleDate}
          eventsByDate={eventsByDate}
          onSelectDate={onSelectDate}
          onEventClick={onEventClick}
        />
      </div>
    </DashboardCard>
  );
};

export default CalendarSection;
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
    <DashboardCard title="캘린더 (Calendar)" subtitle="월 이동과 날짜 선택으로 스케줄을 확인합니다.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ color: '#2b4633', fontSize: '17px' }}>{monthLabel}</strong>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onPrevMonth}
              style={{
                border: '1px solid #cfe0d1',
                backgroundColor: '#ffffff',
                color: '#2d6140',
                borderRadius: '10px',
                padding: '7px 11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              이전 달
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              style={{
                border: '1px solid #cfe0d1',
                backgroundColor: '#ffffff',
                color: '#2d6140',
                borderRadius: '10px',
                padding: '7px 11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              다음 달
            </button>
          </div>
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
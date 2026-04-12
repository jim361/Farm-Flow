// 역할: 스케줄러 화면 검증용 임시 DB 데이터 파일입니다.
// 주의: 현재 날짜와 date가 일치하는 일정은 오늘의 할 일과 타임라인에 자동 노출됩니다.

import type { ScheduleEventItem } from './types';

export const SCHEDULE_STORAGE_KEY = 'farmflow:schedules';
export const SCHEDULE_UPDATED_EVENT = 'farmflow:schedules-updated';

export const todayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 임시 DB: 오늘 날짜를 포함한 샘플 일정 세트
export const initialScheduleEvents: ScheduleEventItem[] = [
  {
    id: 'EVT-401',
    title: '일정 1 - A동 아침 환기',
    date: '2026-04-13',
    startTime: '06:30',
    endTime: '07:00',
    category: '환기',
    note: '외부 온도 안정 구간에서 30분 환기',
  },
  {
    id: 'EVT-402',
    title: '양액 공급 1차',
    date: '2026-04-13',
    startTime: '09:10',
    endTime: '09:40',
    category: '관수',
    note: '토마토 구역 EC 2.1 기준',
  },
  {
    id: 'EVT-403',
    title: 'LED 광량 보정',
    date: todayString(),
    startTime: '14:00',
    endTime: '14:25',
    category: '조명',
  },
  {
    id: 'EVT-404',
    title: '야간 온도 점검',
    date: todayString(),
    startTime: '20:30',
    endTime: '21:00',
    category: '점검',
  },
  {
    id: 'EVT-405',
    title: 'B동 오전 환기',
    date: '2026-04-15',
    startTime: '08:40',
    endTime: '09:00',
    category: '환기',
  },
  {
    id: 'EVT-406',
    title: '관수 보정 테스트',
    date: '2026-04-16',
    startTime: '11:10',
    endTime: '11:35',
    category: '관수',
  },
  {
    id: 'EVT-407',
    title: '센서 캘리브레이션',
    date: '2026-04-18',
    startTime: '15:30',
    endTime: '16:00',
    category: '점검',
  },
];

// 한글 주석: 브라우저 저장소에서 일정 데이터를 읽어옵니다. 데이터가 없으면 초기 Mock 데이터를 사용합니다.
export const getStoredScheduleEvents = (): ScheduleEventItem[] => {
  const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!raw) {
    return initialScheduleEvents;
  }

  try {
    const parsed = JSON.parse(raw) as ScheduleEventItem[];
    return Array.isArray(parsed) ? parsed : initialScheduleEvents;
  } catch {
    return initialScheduleEvents;
  }
};

// 한글 주석: 일정 데이터를 저장하고 레이아웃/사이드바에 즉시 반영되도록 커스텀 이벤트를 발생시킵니다.
export const saveScheduleEvents = (events: ScheduleEventItem[]) => {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(SCHEDULE_UPDATED_EVENT));
};

// 역할: API 연동 전 화면 동작 확인을 위한 임시 DB(Mock Data)입니다.
// 주의: 실제 백엔드 연동 시 아래 상수는 API 응답 데이터로 교체해야 합니다.

import type { ScheduleEventItem, TodoItem } from './types';

export const initialSchedulerDate = '2026-04-13';

export const initialEvents: ScheduleEventItem[] = [
  {
    id: 'EVT-301',
    title: 'A동 자동 환기',
    date: '2026-04-13',
    startTime: '09:00',
    endTime: '09:20',
    category: '환기',
  },
  {
    id: 'EVT-302',
    title: '양액 공급 1차',
    date: '2026-04-13',
    startTime: '11:00',
    endTime: '11:30',
    category: '관수',
  },
  {
    id: 'EVT-303',
    title: 'LED 광량 보정',
    date: '2026-04-15',
    startTime: '14:00',
    endTime: '14:20',
    category: '조명',
  },
];

export const initialTodos: TodoItem[] = [
  { id: 'TD-901', date: '2026-04-13', text: 'A동 유량 센서 상태 점검', done: false },
  { id: 'TD-902', date: '2026-04-13', text: 'B동 환기팬 소음 로그 확인', done: true },
  { id: 'TD-903', date: '2026-04-15', text: '조도 센서 오프셋 기록 업로드', done: false },
];

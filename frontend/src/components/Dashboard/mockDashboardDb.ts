// 임시 DB: API 연동 전 대시보드 레이아웃/값 확인용 더미 데이터입니다.
// 실제 API 연결 시 각 섹션에서 이 파일 import를 제거하고 서버 응답으로 대체하세요.

export interface MetricItem {
  id: string;
  label: string;
  unit: string;
  value: number;
  trend: number;
  state: 'stable' | 'warning';
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  greenhouse: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  task: string;
  done: boolean;
}

export const weatherNow = {
  greenhouseName: 'A동 토마토 하우스',
  weatherLabel: '맑음',
  outsideTemp: 21,
  outsideHumidity: 56,
  windSpeed: 2.7,
  updatedAt: '09:42',
};

export const metricsNow: MetricItem[] = [
  { id: 'temp', label: '온도', unit: '°C', value: 24.1, trend: 0.7, state: 'stable' },
  { id: 'humidity', label: '습도', unit: '%', value: 63, trend: -1.2, state: 'stable' },
  { id: 'co2', label: 'CO2', unit: 'ppm', value: 892, trend: 4.5, state: 'warning' },
  { id: 'light', label: '조도', unit: 'lux', value: 12740, trend: 3.3, state: 'stable' },
];

export const upcomingSchedules: ScheduleItem[] = [
  { id: 'SCH-1004', title: '관수 1차', time: '10:00 - 10:20', greenhouse: 'A동' },
  { id: 'SCH-1007', title: '환기 자동 제어', time: '13:30 - 14:00', greenhouse: 'B동' },
  { id: 'SCH-1011', title: '차광막 점검', time: '16:00 - 16:15', greenhouse: 'A동' },
];

export const activeWorkflows: WorkflowItem[] = [
  { id: 'WF-2001', name: '지능형 환기 로직', status: 'ACTIVE', updatedAt: '오늘 09:20' },
  { id: 'WF-2003', name: '정밀 관수 시스템', status: 'ACTIVE', updatedAt: '오늘 08:47' },
  { id: 'WF-2010', name: 'CO2 보정 제어', status: 'PAUSED', updatedAt: '어제 19:02' },
];

// 임시 DB: 오늘의 할 일 테스트용 데이터입니다.
export const todayTodoList: TodoItem[] = [
  { id: 'TODO-001', task: 'A동 관수 파이프 압력 확인', done: false },
  { id: 'TODO-002', task: 'B동 환기팬 이상 로그 점검', done: false },
  { id: 'TODO-003', task: 'CO2 센서 교정 기록 업로드', done: true },
];
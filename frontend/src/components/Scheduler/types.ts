// 역할: 스케줄러 페이지에서 공통으로 사용하는 타입 정의 파일입니다.

export interface ScheduleEventItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: '환기' | '관수' | '조명' | '점검';
  note?: string;
}

export interface TodoItem {
  id: string;
  date: string;
  text: string;
  done: boolean;
}

export interface EventEditPayload {
  title: string;
  startTime: string;
  endTime: string;
  category: ScheduleEventItem['category'];
  note?: string;
}

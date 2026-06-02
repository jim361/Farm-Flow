export type ScheduleCategory = "관수" | "환기" | "영양" | "조명" | "점검";

export interface ScheduleEventItem {
  id: string;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
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
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  note?: string;
}

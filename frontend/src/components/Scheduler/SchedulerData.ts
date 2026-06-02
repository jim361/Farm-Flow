import type { ScheduleCategory, ScheduleEventItem } from "./types";

export const SCHEDULE_STORAGE_KEY = "farmflow:schedules";
export const SCHEDULE_UPDATED_EVENT = "farmflow:schedules-updated";

const categories: ScheduleCategory[] = ["관수", "환기", "영양", "조명", "점검"];

export const todayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeCategory = (value: unknown): ScheduleCategory => {
  return categories.includes(value as ScheduleCategory) ? (value as ScheduleCategory) : "관수";
};

const normalizeEvent = (event: Partial<ScheduleEventItem>, index: number): ScheduleEventItem => {
  const date = typeof event.date === "string" && event.date ? event.date : todayString();
  const endDate = typeof event.endDate === "string" && event.endDate ? event.endDate : date;

  return {
    id: typeof event.id === "string" && event.id ? event.id : `EVT-${Date.now()}-${index}`,
    title: typeof event.title === "string" && event.title ? event.title : "새 일정",
    date,
    endDate: endDate < date ? date : endDate,
    startTime: typeof event.startTime === "string" && event.startTime ? event.startTime : "09:00",
    endTime: typeof event.endTime === "string" && event.endTime ? event.endTime : "09:30",
    category: normalizeCategory(event.category),
    note: typeof event.note === "string" ? event.note : "",
  };
};

export const initialScheduleEvents: ScheduleEventItem[] = [
  {
    id: "EVT-401",
    title: "A동 관수 점검",
    date: todayString(),
    endDate: todayString(),
    startTime: "06:30",
    endTime: "07:00",
    category: "관수",
    note: "시연용 기본 관수 일정",
  },
  {
    id: "EVT-402",
    title: "영양액 공급",
    date: todayString(),
    endDate: todayString(),
    startTime: "09:10",
    endTime: "09:40",
    category: "영양",
  },
  {
    id: "EVT-403",
    title: "LED 조도 보정",
    date: todayString(),
    endDate: todayString(),
    startTime: "14:00",
    endTime: "14:25",
    category: "조명",
  },
  {
    id: "EVT-404",
    title: "야간 센서 점검",
    date: todayString(),
    endDate: todayString(),
    startTime: "20:30",
    endTime: "21:00",
    category: "점검",
  },
];

export const getStoredScheduleEvents = (): ScheduleEventItem[] => {
  const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!raw) return initialScheduleEvents;

  try {
    const parsed = JSON.parse(raw) as Partial<ScheduleEventItem>[];
    return Array.isArray(parsed) ? parsed.map(normalizeEvent) : initialScheduleEvents;
  } catch {
    return initialScheduleEvents;
  }
};

export const saveScheduleEvents = (events: ScheduleEventItem[]) => {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(SCHEDULE_UPDATED_EVENT));
};

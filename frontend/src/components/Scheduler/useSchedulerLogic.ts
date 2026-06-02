import { useMemo, useSyncExternalStore } from "react";
import { getStoredScheduleEvents, saveScheduleEvents } from "./SchedulerData";
import { formatDateString } from "./schedulerDateUtils";
import type { EventEditPayload, ScheduleEventItem } from "./types";

interface SchedulerSnapshot {
  events: ScheduleEventItem[];
  completedEventIds: string[];
}

interface CreatePayload {
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: ScheduleEventItem["category"];
  note?: string;
}

let snapshot: SchedulerSnapshot = {
  events: getStoredScheduleEvents(),
  completedEventIds: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const setSnapshot = (next: SchedulerSnapshot) => {
  snapshot = next;
  saveScheduleEvents(next.events);
  emit();
};

export const useSchedulerLogic = () => {
  const state = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );

  const todayDate = formatDateString(new Date());

  const isDateInEventRange = (date: string, event: ScheduleEventItem) => {
    const endDate = event.endDate || event.date;
    return event.date <= date && date <= endDate;
  };

  const datesInEventRange = (event: ScheduleEventItem) => {
    const dates: string[] = [];
    const endDate = event.endDate || event.date;
    const current = new Date(`${event.date}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (current <= end) {
      dates.push(formatDateString(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const eventsByDate = useMemo(() => {
    return state.events.reduce<Record<string, ScheduleEventItem[]>>((acc, event) => {
      datesInEventRange(event).forEach((date) => {
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        acc[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
      return acc;
    }, {});
  }, [state.events]);

  const todayEvents = useMemo(() => {
    return state.events
      .filter((event) => isDateInEventRange(todayDate, event))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [state.events, todayDate]);

  const createEvent = (payload: CreatePayload) => {
    setSnapshot({
      ...state,
      events: [...state.events, { id: `EVT-${Date.now()}`, ...payload }],
    });
  };

  const updateEvent = (eventId: string, payload: EventEditPayload) => {
    setSnapshot({
      ...state,
      events: state.events.map((event) => (event.id === eventId ? { ...event, ...payload } : event)),
    });
  };

  const deleteEvent = (eventId: string) => {
    setSnapshot({
      events: state.events.filter((event) => event.id !== eventId),
      completedEventIds: state.completedEventIds.filter((id) => id !== eventId),
    });
  };

  const toggleComplete = (eventId: string) => {
    const nextDone = state.completedEventIds.includes(eventId)
      ? state.completedEventIds.filter((id) => id !== eventId)
      : [...state.completedEventIds, eventId];

    setSnapshot({
      ...state,
      completedEventIds: nextDone,
    });
  };

  return {
    events: state.events,
    completedEventIds: state.completedEventIds,
    eventsByDate,
    todayDate,
    todayEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  };
};

// 역할: Dashboard와 Schedular가 함께 사용하는 전역 일정 상태 및 액션 훅입니다.

import { useMemo, useSyncExternalStore } from 'react';
import { getStoredScheduleEvents, saveScheduleEvents } from './SchedulerData';
import { formatDateString } from './schedulerDateUtils';
import type { EventEditPayload, ScheduleEventItem } from './types';

interface SchedulerSnapshot {
  events: ScheduleEventItem[];
  completedEventIds: string[];
}

interface CreatePayload {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: ScheduleEventItem['category'];
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

  const eventsByDate = useMemo(() => {
    return state.events.reduce<Record<string, ScheduleEventItem[]>>((acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [state.events]);

  const todayEvents = useMemo(() => {
    // 한글 주석: 오늘 날짜(new Date)와 일치하는 데이터만 To-do와 타임라인에 노출합니다.
    return state.events
      .filter((event) => event.date === todayDate)
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

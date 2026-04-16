// 역할: 스케줄러 페이지의 상태/필터링/CRUD 동작을 통합 관리하는 커스텀 훅입니다.

import { useMemo, useState } from 'react';
import { firstDateOfMonth } from './schedulerDateUtils';
import { useSchedulerLogic } from './useSchedulerLogic';

export const useSchedulerState = () => {
  const { eventsByDate, todayDate, todayEvents, completedEventIds, createEvent, updateEvent, deleteEvent, toggleComplete, events } = useSchedulerLogic();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [visibleDate, setVisibleDate] = useState(() => firstDateOfMonth(todayDate));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) {
      return null;
    }
    return events.find((event) => event.id === selectedEventId) ?? null;
  }, [events, selectedEventId]);

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const openEditModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedEventId(null);
  };

  const selectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setVisibleDate(firstDateOfMonth(dateString));
  };

  const changeMonth = (delta: number) => {
    setVisibleDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const createAndSelectEvent = (payload: Parameters<typeof createEvent>[0]) => {
    createEvent(payload);
    selectDate(payload.date);
  };

  return {
    todayDate,
    selectedDate,
    visibleDate,
    eventsByDate,
    todayEvents,
    completedEventIds,
    selectedEvent,
    addModalOpen,
    editModalOpen,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    selectDate,
    changeMonth,
    createEvent: createAndSelectEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  };
};

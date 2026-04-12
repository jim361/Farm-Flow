import SchedulerHeader from '../components/Scheduler/SchedulerHeader';
import CalendarSection from '../components/Scheduler/CalendarSection';
import TodoSection from '../components/Scheduler/TodoSection';
import EventModal from '../components/Scheduler/EventModal';
import TimelineSection from '../components/Scheduler/TimelineSection';
import AddScheduleModal from '../components/Scheduler/AddScheduleModal';
import { useSchedulerState } from '../components/Scheduler/useSchedulerState';

const Scheduler = () => {
  const {
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
    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  } = useSchedulerState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SchedulerHeader onAddClick={openAddModal} />

      <section
        style={{
          border: '1px solid #d4e4d8',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #f8fcf8 0%, #f2f8f3 100%)',
          boxShadow: '0 10px 24px rgba(34, 62, 42, 0.08)',
          padding: '14px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)',
          gap: '14px',
        }}
      >
        <CalendarSection
          selectedDate={selectedDate}
          visibleDate={visibleDate}
          eventsByDate={eventsByDate}
          onSelectDate={selectDate}
          onPrevMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
          onEventClick={openEditModal}
        />

        <TodoSection
          todayDate={todayDate}
          todayEvents={todayEvents}
          completedEventIds={completedEventIds}
          onToggleComplete={toggleComplete}
          onOpenEditModal={openEditModal}
        />

        <div style={{ gridColumn: '1 / -1' }}>
          <TimelineSection
            todayDate={todayDate}
            events={todayEvents}
            completedEventIds={completedEventIds}
            onToggleComplete={toggleComplete}
            onEventClick={openEditModal}
          />
        </div>
      </section>

      <AddScheduleModal
        open={addModalOpen}
        defaultDate={selectedDate}
        onClose={closeAddModal}
        onCreate={createEvent}
      />

      <EventModal
        open={Boolean(editModalOpen)}
        selectedEvent={selectedEvent}
        onClose={closeEditModal}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  );
};

export default Scheduler;
import SchedulerHeader from '../components/Scheduler/SchedulerHeader';
import CalendarSection from '../components/Scheduler/CalendarSection';
import TodoSection from '../components/Scheduler/TodoSection';
import EventModal from '../components/Scheduler/EventModal';
import TimelineSection from '../components/Scheduler/TimelineSection';
import AddScheduleModal from '../components/Scheduler/AddScheduleModal';
import { useSchedulerState } from '../components/Scheduler/useSchedulerState';

const Scheduler = () => {
  const { todayDate, selectedDate, visibleDate, eventsByDate, todayEvents, completedEventIds, selectedEvent, addModalOpen, editModalOpen, openAddModal, closeAddModal, openEditModal, closeEditModal, selectDate, changeMonth, createEvent, updateEvent, deleteEvent, toggleComplete } = useSchedulerState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 2px', fontFamily: 'Pretendard, "Segoe UI", system-ui, sans-serif' }}>
      <SchedulerHeader onAddClick={openAddModal} />

      <section
        style={{
          border: '1px solid #e4e3ee',
          borderRadius: '22px',
          background: '#efedf6',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.15fr) minmax(0, 0.85fr)',
          gap: '16px',
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

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e7e9f1',
            borderRadius: '18px',
            padding: '12px',
            alignSelf: 'start',
          }}
        >
          <TodoSection
            todayDate={todayDate}
            todayEvents={todayEvents}
            completedEventIds={completedEventIds}
            onToggleComplete={toggleComplete}
            onOpenEditModal={openEditModal}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '-4px' }}>
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
import AddScheduleModal from "../components/Scheduler/AddScheduleModal";
import EventModal from "../components/Scheduler/EventModal";
import { useSchedulerState } from "../components/Scheduler/useSchedulerState";
import type { ScheduleEventItem } from "../components/Scheduler/types";

const weekdayLabel = ["일", "월", "화", "수", "목", "금", "토"];

const categoryColor: Record<ScheduleEventItem["category"], string> = {
  관수: "#dff7e8",
  환기: "#dcfce7",
  영양: "#e0ecff",
  조명: "#fff2c7",
  점검: "#ebe7ff",
};

const categoryText: Record<ScheduleEventItem["category"], string> = {
  관수: "#166534",
  환기: "#15803d",
  영양: "#1d4ed8",
  조명: "#92400e",
  점검: "#5b21b6",
};

const toDateString = (year: number, monthIndex: number, day: number) => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

const parseMinute = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toPercent = (minute: number) => (minute / (24 * 60)) * 100;

const periodLabel = (event: ScheduleEventItem) => {
  const endDate = event.endDate || event.date;
  return event.date === endDate ? event.date : `${event.date} ~ ${endDate}`;
};

const timelineBoundsForDate = (event: ScheduleEventItem, date: string) => {
  const endDate = event.endDate || event.date;
  const startMinute = event.date === date ? parseMinute(event.startTime) : 0;
  let endMinute = endDate === date ? parseMinute(event.endTime) : 24 * 60;

  if (event.date === endDate && endMinute <= startMinute) {
    endMinute = 24 * 60;
  }
  if (endMinute <= startMinute) {
    endMinute = 24 * 60;
  }

  return {
    startMinute,
    widthMinute: Math.max(15, endMinute - startMinute),
  };
};

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

  const year = visibleDate.getFullYear();
  const monthIndex = visibleDate.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const days = [
    ...Array.from({ length: firstWeekday }, () => 0),
    ...Array.from({ length: lastDay }, (_, index) => index + 1),
  ];
  while (days.length % 7 !== 0) days.push(0);
  const selectedEvents = eventsByDate[selectedDate] ?? [];

  return (
    <div className="scheduler-page">
      <div className="scheduler-head">
        <div>
          <h1>스케줄러</h1>
          <p>하루 일정부터 며칠 동안 이어지는 작업 기간까지 한 번에 관리합니다.</p>
        </div>
        <button type="button" className="ff-btn-save" onClick={openAddModal}>일정 추가</button>
      </div>

      <div className="scheduler-grid">
        <section className="scheduler-card scheduler-calendar">
          <div className="scheduler-card-head">
            <div>
              <h2>{year}년 {monthIndex + 1}월</h2>
              <p>선택 날짜: {selectedDate}</p>
            </div>
            <div className="scheduler-nav">
              <button type="button" onClick={() => changeMonth(-1)}>이전</button>
              <button type="button" onClick={() => changeMonth(1)}>다음</button>
            </div>
          </div>

          <div className="scheduler-weekdays">
            {weekdayLabel.map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className="scheduler-days">
            {days.map((day, index) => {
              if (day === 0) return <div key={`empty-${index}`} className="scheduler-day scheduler-day--empty" />;
              const date = toDateString(year, monthIndex, day);
              const events = eventsByDate[date] ?? [];
              const active = date === selectedDate;

              return (
                <button
                  key={date}
                  type="button"
                  className={`scheduler-day${active ? " scheduler-day--active" : ""}`}
                  onClick={() => selectDate(date)}
                >
                  <strong>{day}</strong>
                  <span>{events.length > 0 ? `${events.length}건` : ""}</span>
                  {events.slice(0, 2).map((event) => (
                    <em key={event.id}>{event.title}</em>
                  ))}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="scheduler-card scheduler-side">
          <h2>선택 날짜 일정</h2>
          {selectedEvents.length === 0 ? (
            <p className="scheduler-empty">등록된 일정이 없습니다.</p>
          ) : (
            selectedEvents.map((event) => (
              <button key={event.id} type="button" className="scheduler-event" onClick={() => openEditModal(event.id)}>
                <span style={{ background: categoryColor[event.category], color: categoryText[event.category] }}>{event.category}</span>
                <strong>{event.title}</strong>
                <small>{periodLabel(event)} · {event.startTime} - {event.endTime}</small>
              </button>
            ))
          )}
        </aside>

        <section className="scheduler-card scheduler-today">
          <div className="scheduler-card-head">
            <div>
              <h2>오늘 일정</h2>
              <p>{todayDate}</p>
            </div>
            <span className="scheduler-count">{todayEvents.length}건</span>
          </div>
          {todayEvents.length === 0 ? (
            <p className="scheduler-empty">오늘 등록된 일정이 없습니다.</p>
          ) : (
            todayEvents.map((event) => {
              const done = completedEventIds.includes(event.id);
              return (
                <button key={event.id} type="button" className={`scheduler-todo${done ? " scheduler-todo--done" : ""}`} onClick={() => openEditModal(event.id)}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleComplete(event.id)}
                    onClick={(eventClick) => eventClick.stopPropagation()}
                  />
                  <span>{event.category}</span>
                  <strong>{event.title}</strong>
                  <small>{periodLabel(event)} · {event.startTime} - {event.endTime}</small>
                </button>
              );
            })
          )}
        </section>

        <section className="scheduler-card scheduler-timeline">
          <h2>선택 날짜 24시간 타임라인</h2>
          <p className="scheduler-empty">{selectedDate}</p>
          <div className="scheduler-time-labels">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
          <div className="scheduler-track">
            {selectedEvents.map((event, index) => {
              const bounds = timelineBoundsForDate(event, selectedDate);
              const left = toPercent(bounds.startMinute);
              const width = Math.min(100 - left, toPercent(bounds.widthMinute));
              return (
                <button
                  key={event.id}
                  type="button"
                  className="scheduler-block"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${10 + (index % 3) * 24}px`,
                    background: categoryText[event.category],
                  }}
                  title={`${event.title} · ${periodLabel(event)} · ${event.startTime} - ${event.endTime}`}
                  onClick={() => openEditModal(event.id)}
                >
                  {event.title}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <AddScheduleModal open={addModalOpen} defaultDate={selectedDate} onClose={closeAddModal} onCreate={createEvent} />
      <EventModal open={Boolean(editModalOpen)} selectedEvent={selectedEvent} onClose={closeEditModal} onUpdate={updateEvent} onDelete={deleteEvent} />
    </div>
  );
};

export default Scheduler;

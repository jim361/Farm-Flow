import { useEffect, useState } from "react";
import type { EventEditPayload, ScheduleEventItem } from "./types";

interface EventModalProps {
  open: boolean;
  selectedEvent: ScheduleEventItem | null;
  onClose: () => void;
  onUpdate: (eventId: string, payload: EventEditPayload) => void;
  onDelete: (eventId: string) => void;
}

const categories: ScheduleEventItem["category"][] = ["관수", "환기", "영양", "조명", "점검"];

const EventModal = ({ open, selectedEvent, onClose, onUpdate, onDelete }: EventModalProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [category, setCategory] = useState<ScheduleEventItem["category"]>("관수");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !selectedEvent) return;
    setTitle(selectedEvent.title);
    setDate(selectedEvent.date);
    setEndDate(selectedEvent.endDate || selectedEvent.date);
    setStartTime(selectedEvent.startTime);
    setEndTime(selectedEvent.endTime);
    setCategory(selectedEvent.category);
    setNote(selectedEvent.note ?? "");
  }, [open, selectedEvent]);

  useEffect(() => {
    if (date && endDate && endDate < date) {
      setEndDate(date);
    }
  }, [date, endDate]);

  if (!open || !selectedEvent) return null;

  const close = () => {
    setTitle("");
    setDate("");
    setEndDate("");
    setStartTime("09:00");
    setEndTime("09:30");
    setCategory("관수");
    setNote("");
    onClose();
  };

  const submitUpdate = () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !date || !endDate) return;
    onUpdate(selectedEvent.id, { title: normalizedTitle, date, endDate, startTime, endTime, category, note: note.trim() });
    close();
  };

  const removeEvent = () => {
    onDelete(selectedEvent.id);
    close();
  };

  return (
    <div role="presentation" onClick={close} className="scheduler-modal-overlay">
      <div role="dialog" aria-modal="true" aria-label="일정 수정" onClick={(event) => event.stopPropagation()} className="scheduler-modal">
        <h3>일정 수정</h3>
        <p className="scheduler-modal-date">{date === endDate ? date : `${date} ~ ${endDate}`}</p>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="일정 이름" />
        <div className="scheduler-modal-row">
          <label className="scheduler-modal-field">
            시작 날짜
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="scheduler-modal-field">
            종료 날짜
            <input type="date" value={endDate} min={date} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        </div>
        <div className="scheduler-modal-row">
          <label className="scheduler-modal-field">
            시작 시간
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </label>
          <label className="scheduler-modal-field">
            종료 시간
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </label>
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value as ScheduleEventItem["category"])}>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="메모" rows={3} />
        <div className="scheduler-modal-actions">
          <button type="button" className="scheduler-btn danger" onClick={removeEvent}>삭제</button>
          <button type="button" className="scheduler-btn secondary" onClick={close}>취소</button>
          <button type="button" className="scheduler-btn primary" onClick={submitUpdate}>수정 저장</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

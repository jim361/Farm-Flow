import { useEffect, useState } from "react";
import type { ScheduleEventItem } from "./types";

interface AddScheduleModalProps {
  open: boolean;
  defaultDate: string;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    date: string;
    endDate: string;
    startTime: string;
    endTime: string;
    category: ScheduleEventItem["category"];
    note?: string;
  }) => void;
}

const categories: ScheduleEventItem["category"][] = ["관수", "환기", "영양", "조명", "점검"];

const AddScheduleModal = ({ open, defaultDate, onClose, onCreate }: AddScheduleModalProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [category, setCategory] = useState<ScheduleEventItem["category"]>("관수");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setEndDate(defaultDate);
  }, [defaultDate, open]);

  useEffect(() => {
    if (endDate < date) {
      setEndDate(date);
    }
  }, [date, endDate]);

  if (!open) return null;

  const close = () => {
    setTitle("");
    setDate(defaultDate);
    setEndDate(defaultDate);
    setStartTime("09:00");
    setEndTime("09:30");
    setCategory("관수");
    setNote("");
    onClose();
  };

  const submit = () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !date || !endDate) return;
    onCreate({ title: normalizedTitle, date, endDate, startTime, endTime, category, note: note.trim() });
    close();
  };

  return (
    <div role="presentation" onClick={close} className="scheduler-modal-overlay">
      <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} className="scheduler-modal">
        <h3>일정 추가</h3>
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
          <button type="button" className="scheduler-btn secondary" onClick={close}>취소</button>
          <button type="button" className="scheduler-btn primary" onClick={submit}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;

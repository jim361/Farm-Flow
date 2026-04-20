// 역할: 새 일정을 등록하는 모달 컴포넌트입니다.

import { useEffect, useState } from 'react';
import type { ScheduleEventItem } from './types';

interface AddScheduleModalProps {
  open: boolean;
  defaultDate: string;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: ScheduleEventItem['category'];
    note?: string;
  }) => void;
}

const AddScheduleModal = ({ open, defaultDate, onClose, onCreate }: AddScheduleModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [category, setCategory] = useState<ScheduleEventItem['category']>('환기');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setDate(defaultDate);
  }, [defaultDate, open]);

  if (!open) return null;

  const close = () => {
    setTitle('');
    setDate(defaultDate);
    setStartTime('09:00');
    setEndTime('09:30');
    setCategory('환기');
    setNote('');
    onClose();
  };

  const submit = () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !date) return;
    // 한글 주석: 입력된 데이터를 상위 상태로 전달해 일정 배열을 즉시 갱신합니다.
    onCreate({ title: normalizedTitle, date, startTime, endTime, category, note: note.trim() });
    close();
  };

  return (
    <div role="presentation" onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(20,24,34,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '500px', backgroundColor: '#f9f9fe', border: '1px solid #dde2ef', borderRadius: '20px', boxShadow: '0 26px 54px rgba(34,40,58,0.24)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, color: '#1e2430', fontSize: '24px', letterSpacing: '-0.01em' }}>새 일정 추가</h3>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="일정 이름" style={{ border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }} />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} style={{ flex: 1, border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }} />
          <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} style={{ flex: 1, border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }} />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value as ScheduleEventItem['category'])} style={{ border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }}>
          <option value="환기">환기</option><option value="관수">관수</option><option value="조명">조명</option><option value="점검">점검</option>
        </select>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="메모" rows={3} style={{ border: '1px solid #d7ddeb', borderRadius: '12px', padding: '12px', resize: 'none', backgroundColor: '#ffffff' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" onClick={close} style={{ border: '1px solid #d4dbea', borderRadius: '12px', padding: '10px 14px', background: '#fff', cursor: 'pointer', color: '#3a4257', fontWeight: 700 }}>취소</button>
          <button type="button" onClick={submit} style={{ border: 'none', borderRadius: '12px', padding: '10px 16px', background: '#004d26', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 18px rgba(0, 77, 38, 0.2)' }}>일정 저장</button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;

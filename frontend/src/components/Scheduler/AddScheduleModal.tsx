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
    <div role="presentation" onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(18,33,25,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '460px', backgroundColor: '#fff', border: '1px solid #cfe0d1', borderRadius: '14px', boxShadow: '0 18px 40px rgba(34,62,42,0.22)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#24402d' }}>새 일정 추가</h3>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="일정 이름" style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }} />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} style={{ flex: 1, border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }} />
          <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} style={{ flex: 1, border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }} />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value as ScheduleEventItem['category'])} style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }}>
          <option value="환기">환기</option><option value="관수">관수</option><option value="조명">조명</option><option value="점검">점검</option>
        </select>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="메모" rows={3} style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px', resize: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" onClick={close} style={{ border: '1px solid #d4ddd5', borderRadius: '10px', padding: '8px 12px', background: '#fff', cursor: 'pointer' }}>취소</button>
          <button type="button" onClick={submit} style={{ border: 'none', borderRadius: '10px', padding: '8px 12px', background: '#2f6b43', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>일정 저장</button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;

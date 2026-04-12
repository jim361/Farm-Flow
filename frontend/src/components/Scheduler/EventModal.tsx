// 역할: 선택된 일정의 수정/삭제를 처리하는 상세 편집 모달 컴포넌트입니다.

import { useEffect, useState } from 'react';
import type { EventEditPayload, ScheduleEventItem } from './types';

interface EventModalProps {
  open: boolean;
  selectedEvent: ScheduleEventItem | null;
  onClose: () => void;
  onUpdate: (eventId: string, payload: EventEditPayload) => void;
  onDelete: (eventId: string) => void;
}

const EventModal = ({ open, selectedEvent, onClose, onUpdate, onDelete }: EventModalProps) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [category, setCategory] = useState<ScheduleEventItem['category']>('환기');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open || !selectedEvent) {
      return;
    }
    setTitle(selectedEvent.title);
    setStartTime(selectedEvent.startTime);
    setEndTime(selectedEvent.endTime);
    setCategory(selectedEvent.category);
    setNote(selectedEvent.note ?? '');
  }, [open, selectedEvent]);

  if (!open || !selectedEvent) {
    return null;
  }

  const submitUpdate = () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }

    // 한글 주석: 선택한 일정의 수정값을 상위 상태로 전달해 데이터 저장을 수행합니다.
    onUpdate(selectedEvent.id, { title: normalizedTitle, startTime, endTime, category, note: note.trim() });
    setTitle('');
    setStartTime('09:00');
    setEndTime('09:30');
    setCategory('환기');
    setNote('');
    onClose();
  };

  const removeEvent = () => {
    // 한글 주석: 현재 선택된 일정 삭제를 상위 상태로 전달합니다.
    onDelete(selectedEvent.id);
    setTitle('');
    setStartTime('09:00');
    setEndTime('09:30');
    setCategory('환기');
    setNote('');
    onClose();
  };

  const closeAndReset = () => {
    setTitle('');
    setStartTime('09:00');
    setEndTime('09:30');
    setCategory('환기');
    setNote('');
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={closeAndReset}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 35, 25, 0.46)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="일정 수정 및 삭제"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #cfe0d1',
          boxShadow: '0 18px 40px rgba(34, 62, 42, 0.22)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <h3 style={{ margin: 0, color: '#24402d' }}>일정 수정</h3>
        <p style={{ margin: 0, color: '#6b7a6f', fontSize: '13px' }}>{selectedEvent.date}</p>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="일정 이름"
          style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            style={{ flex: 1, border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }}
          />
          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            style={{ flex: 1, border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }}
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ScheduleEventItem['category'])}
          style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px' }}
        >
          <option value="환기">환기</option>
          <option value="관수">관수</option>
          <option value="조명">조명</option>
          <option value="점검">점검</option>
        </select>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="메모"
          rows={3}
          style={{ border: '1px solid #d4e2d6', borderRadius: '10px', padding: '10px', resize: 'none' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={removeEvent}
            style={{
              border: '1px solid #f0d5d5',
              borderRadius: '10px',
              padding: '8px 12px',
              backgroundColor: '#fff7f7',
              color: '#8f3f3f',
              cursor: 'pointer',
            }}
          >
            삭제
          </button>
          <button
            type="button"
            onClick={closeAndReset}
            style={{
              border: '1px solid #d4ddd5',
              borderRadius: '10px',
              padding: '8px 12px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={submitUpdate}
            style={{
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              backgroundColor: '#2f6b43',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            수정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

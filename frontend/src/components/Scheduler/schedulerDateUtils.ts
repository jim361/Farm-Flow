// 역할: 스케줄러에서 사용하는 날짜/시간 변환 유틸 모음입니다.

export const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseTimeToMinute = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const toTimelinePercent = (minute: number) => (minute / (24 * 60)) * 100;

export const firstDateOfMonth = (dateString: string) => {
  const [year, month] = dateString.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

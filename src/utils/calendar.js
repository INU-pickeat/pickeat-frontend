export function formatCalendarDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getCalendarCells(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstDay + 1);
    return {
      day: date.getDate(),
      isCurrent: date.getFullYear() === year && date.getMonth() === month,
      dateStr: formatCalendarDate(date),
    };
  });
}

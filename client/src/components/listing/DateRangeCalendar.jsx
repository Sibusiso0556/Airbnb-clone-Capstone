import { useState } from 'react';
import './DateRangeCalendar.css';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  return cells;
}

export default function DateRangeCalendar({ checkIn, checkOut, onChange }) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const base = checkIn ? new Date(checkIn) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const checkInDate = checkIn ? startOfDay(new Date(checkIn)) : null;
  const checkOutDate = checkOut ? startOfDay(new Date(checkOut)) : null;

  function handleDayClick(date) {
    if (!date || date < today) return;
    if (!checkInDate || (checkInDate && checkOutDate)) {
      onChange(toISODate(date), '');
      return;
    }
    if (date <= checkInDate) {
      onChange(toISODate(date), '');
      return;
    }
    onChange(toISODate(checkInDate), toISODate(date));
  }

  function dayState(date) {
    if (!date) return '';
    const d = startOfDay(date);
    if (checkInDate && d.getTime() === checkInDate.getTime()) return 'range-start';
    if (checkOutDate && d.getTime() === checkOutDate.getTime()) return 'range-end';
    if (checkInDate && checkOutDate && d > checkInDate && d < checkOutDate) return 'in-range';
    return '';
  }

  function renderMonth(year, month) {
    const cells = buildMonthGrid(year, month);
    const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return (
      <div className="date-calendar__month" key={`${year}-${month}`}>
        <p className="date-calendar__month-label">{label}</p>
        <div className="date-calendar__weekdays">
          {DAY_LABELS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="date-calendar__grid">
          {cells.map((date, i) => {
            const disabled = !date || date < today;
            return (
              <button
                key={i}
                type="button"
                className={`date-calendar__day ${dayState(date)}`}
                disabled={disabled}
                onClick={() => handleDayClick(date)}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    <div className="date-calendar">
      <div className="date-calendar__header">
        <button
          type="button"
          className="date-calendar__nav"
          aria-label="Previous month"
          onClick={() => setViewDate((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <button
          type="button"
          className="date-calendar__nav"
          aria-label="Next month"
          onClick={() => setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="date-calendar__months">
        {renderMonth(viewDate.getFullYear(), viewDate.getMonth())}
        {renderMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth())}
      </div>
      {(checkIn || checkOut) && (
        <button type="button" className="date-calendar__clear" onClick={() => onChange('', '')}>
          Clear dates
        </button>
      )}
    </div>
  );
}

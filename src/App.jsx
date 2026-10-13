import { useMemo, useState } from "react";

const defaultCheckin = {
  hour: "09",
  minute: "00",
  second: "00",
  period: "AM",
};

const defaultCheckout = {
  hour: "05",
  minute: "00",
  second: "00",
  period: "PM",
};

function parseTimeParts(value) {
  const hour = Number(value.hour);
  const minute = Number(value.minute);
  const second = Number(value.second);
  const period = value.period;

  let total = hour % 12;
  if (period === "PM") total += 12;
  if (period === "AM" && hour === 12) total = 0;

  return total * 3600 + minute * 60 + second;
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    text: `${hours}h ${minutes}m ${seconds}s`,
    decimalHours: (safeSeconds / 3600).toFixed(2),
  };
}

export default function App() {
  const [checkin, setCheckin] = useState(defaultCheckin);
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [breakMinutes, setBreakMinutes] = useState(30);

  const result = useMemo(() => {
    const checkinSeconds = parseTimeParts(checkin);
    let checkoutSeconds = parseTimeParts(checkout);

    // If checkout is before checkin, assume next day
    if (checkoutSeconds <= checkinSeconds) {
      checkoutSeconds += 24 * 3600;
    }

    const totalOfficeSeconds = checkoutSeconds - checkinSeconds;
    const breakSeconds = Number(breakMinutes || 0) * 60;
    const workedSeconds = Math.max(0, totalOfficeSeconds - breakSeconds);

    return {
      totalOffice: formatDuration(totalOfficeSeconds),
      worked: formatDuration(workedSeconds),
      totalOfficeSeconds,
      workedSeconds,
    };
  }, [checkin, checkout, breakMinutes]);

  const updateTime = (field, value, type) => {
    if (type === "checkin") {
      setCheckin((prev) => ({ ...prev, [field]: value }));
    } else {
      setCheckout((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Office Hours Calculator</h1>
        <p>Enter your check-in and check-out times to calculate office hours and work time.</p>
      </header>

      <main className="calculator-card">
        <section className="time-panel">
          <div className="time-group">
            <label className="section-label">Check-In</label>

            <div className="time-row">
              <input
                type="number"
                min="1"
                max="12"
                value={checkin.hour}
                onChange={(e) => updateTime("hour", e.target.value, "checkin")}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={checkin.minute}
                onChange={(e) => updateTime("minute", e.target.value, "checkin")}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={checkin.second}
                onChange={(e) => updateTime("second", e.target.value, "checkin")}
              />
              <select
                value={checkin.period}
                onChange={(e) => updateTime("period", e.target.value, "checkin")}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="time-group">
            <label className="section-label">Check-Out</label>

            <div className="time-row">
              <input
                type="number"
                min="1"
                max="12"
                value={checkout.hour}
                onChange={(e) => updateTime("hour", e.target.value, "checkout")}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={checkout.minute}
                onChange={(e) => updateTime("minute", e.target.value, "checkout")}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={checkout.second}
                onChange={(e) => updateTime("second", e.target.value, "checkout")}
              />
              <select
                value={checkout.period}
                onChange={(e) => updateTime("period", e.target.value, "checkout")}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="break-box">
            <label htmlFor="breakMinutes">Break (Minutes)</label>
            <input
              id="breakMinutes"
              type="number"
              min="0"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
            />
          </div>
        </section>

        <aside className="result-panel">
          <h2>Results</h2>

          <div className="result-row">
            <span className="label">Office Time</span>
            <span className="value">{result.totalOffice.text}</span>
          </div>

          <div className="result-row">
            <span className="label">Worked Time</span>
            <span className="value">{result.worked.text}</span>
          </div>

          <div className="result-row">
            <span className="label">Decimal Hours</span>
            <span className="value">{result.worked.decimalHours} hrs</span>
          </div>
        </aside>
      </main>
    </div>
  );
}
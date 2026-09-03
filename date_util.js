function getISOWeek(date) {
  const dt = new Date(date.valueOf());
  const dayn = (date.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - dayn + 3);
  const firstThursday = dt.valueOf();
  dt.setMonth(0, 1);
  if (dt.getDay() !== 4) {
    dt.setMonth(0, 1 + ((4 - dt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - dt) / 604800000);
}
function getISOWeekString(date) {
  const d = new Date(date);
  const week = getISOWeek(d);
  const year = d.getFullYear(); // wait, year might be different for week 1 / 52
  // Better approach:
  const dt = new Date(d.valueOf());
  dt.setDate(dt.getDate() - ((d.getDay() + 6) % 7) + 3);
  return `${dt.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}
console.log(getISOWeekString(new Date("2026-08-17")));
console.log(getISOWeekString(new Date("2026-08-19")));

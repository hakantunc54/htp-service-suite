const orders = [
  { kundenTerminStart: new Date("2026-08-17T10:00:00Z"), name: "Order 17" },
  { kundenTerminStart: new Date("2026-08-19T10:00:00Z"), name: "Order 19" }
];
const dateFilter = "2026-08-17";

const filtered = orders.filter(o => {
  let matchesDate = true;
  if (dateFilter) {
    if (!o.kundenTerminStart) {
      matchesDate = false;
    } else {
      const orderDateStr = new Date(o.kundenTerminStart).toISOString().split('T')[0];
      matchesDate = orderDateStr === dateFilter;
    }
  }
  return matchesDate;
});

console.log(filtered);

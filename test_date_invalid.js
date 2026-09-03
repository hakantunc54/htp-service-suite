const d = new Date("19.8.2026");
console.log("Valid:", !isNaN(d.getTime()));
if (!isNaN(d.getTime())) {
  console.log("ISO:", d.toISOString());
}

for (let i = 0; i < 24 * 60; i++) {
  const d = new Date(Date.UTC(2026, 7, 17, Math.floor(i/60), i%60, 0));
  const iso = d.toISOString().split('T')[0];
  const local = d.toLocaleDateString('de-DE');
  if (iso === "2026-08-17" && local === "19.8.2026") {
     console.log("FOUND:", d.toISOString());
  }
}
console.log("Done");

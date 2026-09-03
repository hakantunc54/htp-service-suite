const d = new Date("2026-08-17T22:00:00.000Z");
console.log("ISO:", d.toISOString().split('T')[0]);
console.log("de-DE:", d.toLocaleDateString('de-DE'));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const columnMap = {
  "FTTB": "FTTB",
  "Abbruch": "Abbruch",
  "Anfahrt >12": "Anfahrt >12",
  "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12",
  "Anfahrt <12": "Anfahrt <12",
};

async function run() {
  const serviceItems = await prisma.serviceItem.findMany();
  
  const colName = "Anfahrt\r\n<12";
  const targetName = columnMap[colName];
  console.log("Target Name:", targetName);
  
  const si = serviceItems.find(i => i.name === targetName);
  console.log("Found Service Item:", si);
}
run();

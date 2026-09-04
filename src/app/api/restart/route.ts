
import { NextResponse } from "next/server";

export async function POST() {
  // Wait 1 second to allow the response to reach the client, then kill the process
  setTimeout(() => {
    console.log("Programmatic restart requested. Exiting process...");
    process.exit(0);
  }, 1000);
  
  return NextResponse.json({ success: true, message: "Server restarts in 1 second" });
}

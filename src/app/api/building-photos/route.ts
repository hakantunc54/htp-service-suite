import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { saveBuildingPhotoMeta, deleteBuildingPhotoMeta } from "@/app/buildings/actions";

// POST: Foto hochladen
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const buildingId = formData.get("buildingId") as string;
    const objectNumber = formData.get("objectNumber") as string;
    const caption = formData.get("caption") as string | null;
    const category = formData.get("category") as string | null;

    if (!file || !buildingId || !objectNumber) {
      return NextResponse.json({ error: "Fehlende Parameter" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Eindeutigen Dateinamen erzeugen
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    
    // Datei speichern
    const relativePath = await storage.save(objectNumber, safeName, buffer);

    // Metadaten in DB speichern
    const photo = await saveBuildingPhotoMeta(
      buildingId,
      relativePath,
      caption || undefined,
      category || undefined,
      buffer.length
    );

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Foto-Upload fehlgeschlagen:", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}

// GET: Foto ausliefern
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Kein Pfad angegeben" }, { status: 400 });
    }

    const data = await storage.get(filePath);
    
    // Content-Type ermitteln
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      heic: "image/heic",
    };
    const contentType = contentTypes[ext || ""] || "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// DELETE: Foto löschen
export async function DELETE(request: NextRequest) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: "Keine Photo-ID" }, { status: 400 });
    }

    const result = await deleteBuildingPhotoMeta(photoId);
    
    if (result.success && result.filename) {
      await storage.delete(result.filename);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Foto-Löschung fehlgeschlagen:", error);
    return NextResponse.json({ error: "Löschung fehlgeschlagen" }, { status: 500 });
  }
}

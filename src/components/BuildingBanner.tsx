"use client";

import { useEffect, useState } from "react";
import { findBuildingByAddress } from "@/app/buildings/actions";
import { Building2, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface BuildingBannerProps {
  address: string;
}

type BuildingInfo = Awaited<ReturnType<typeof findBuildingByAddress>>;

export default function BuildingBanner({ address }: BuildingBannerProps) {
  const [building, setBuilding] = useState<BuildingInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    findBuildingByAddress(address).then(b => {
      setBuilding(b);
      setLoading(false);
    });
  }, [address]);

  if (loading || !building) return null;
  if (building.entryCount === 0 && building.photoCount === 0) return null;

  const statusStyles: Record<string, { bg: string; border: string; icon: any }> = {
    GREEN: { bg: "bg-blue-50", border: "border-blue-200", icon: <Building2 className="w-5 h-5 text-blue-600" /> },
    YELLOW: { bg: "bg-amber-50", border: "border-amber-300", icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> },
    RED: { bg: "bg-red-50", border: "border-red-300", icon: <AlertTriangle className="w-5 h-5 text-red-600" /> },
  };

  const style = statusStyles[building.objectStatus] || statusStyles.GREEN;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {style.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold">{building.displayNumber}</span>
              {building.objectStatus === "YELLOW" && (
                <span className="text-xs font-bold text-amber-700 uppercase">Aufmerksamkeit erforderlich</span>
              )}
              {building.objectStatus === "RED" && (
                <span className="text-xs font-bold text-red-700 uppercase">Kritisches Objekt</span>
              )}
            </div>
            {building.objectStatusNote && (
              <p className="text-sm italic mt-0.5 text-gray-700">{building.objectStatusNote}</p>
            )}
            <div className="text-xs text-gray-600 mt-1">
              {building.entryCount > 0 && <span>{building.entryCount} Vermerke</span>}
              {building.entryCount > 0 && building.photoCount > 0 && <span> · </span>}
              {building.photoCount > 0 && <span>{building.photoCount} Fotos</span>}
            </div>
            {building.primaryContact && (
              <div className="text-sm mt-1">
                <span className="text-gray-500">⭐</span>{" "}
                <span className="font-medium">{building.primaryContact}</span>
                {building.primaryContactRole && <span className="text-gray-500"> ({building.primaryContactRole})</span>}
                {building.primaryContactPhone && (
                  <>
                    {": "}
                    <a href={`tel:${building.primaryContactPhone}`} className="text-blue-600 font-medium hover:underline">
                      {building.primaryContactPhone}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Link href={`/buildings/${building.id}`}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">
          Objektakte öffnen <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

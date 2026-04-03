import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { ComponentType } from "react";
import type { Coordinates } from "../../TYPES";
import type { Facility } from "../../SERVICES/facilitiesService";

export const NearbyServicesMap = ({
  facilities,
  userLocation,
  hasLiveLocation,
}: {
  facilities: Facility[];
  userLocation: Coordinates;
  hasLiveLocation: boolean;
}) => {
  const AnyMapContainer = MapContainer as unknown as ComponentType<Record<string, unknown>>;
  const AnyTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
  const AnyCircleMarker = CircleMarker as unknown as ComponentType<Record<string, unknown>>;
  const AnyPopup = Popup as unknown as ComponentType<Record<string, unknown>>;

  return (
    <div className="lm-leaflet-wrap">
      <AnyMapContainer center={[userLocation.lat, userLocation.lng]} zoom={12} style={{ height: 380, width: "100%" }}>
        <AnyTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {facilities.map((facility) => (
          <AnyCircleMarker
            key={facility.id}
            center={[facility.location.lat, facility.location.lng]}
            radius={8}
            pathOptions={{
              color: facility.type === "police" ? "#3b82f6" : "#22c55e",
              fillColor: facility.type === "police" ? "#3b82f6" : "#22c55e",
              fillOpacity: 0.85,
            }}
          >
            <AnyPopup>
              <div>
                <strong>{facility.name}</strong>
                <p>{facility.type === "police" ? "Police Station" : "Hospital"} - {facility.area}</p>
                <p>{facility.emergencyPhone ? `Emergency: ${facility.emergencyPhone}` : "Emergency line unavailable"}</p>
              </div>
            </AnyPopup>
          </AnyCircleMarker>
        ))}

        {hasLiveLocation ? (
          <AnyCircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={7}
            pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 0.95, className: "lm-live-core" }}
          >
            <AnyPopup>Your current location</AnyPopup>
          </AnyCircleMarker>
        ) : null}
      </AnyMapContainer>
    </div>
  );
};

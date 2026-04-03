import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { ComponentType } from "react";
import type { Coordinates, UnsafeRouteSegment } from "../../TYPES";
import type { NairobiLayers } from "../../SERVICES/mapService";

const MapFollower = ({ lat, lng }: Coordinates) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() < 15 ? 15 : map.getZoom(), { animate: true, duration: 0.8 });
  }, [lat, lng, map]);
  return null;
};

export const LiveNavigationMap = ({
  userLocation,
  destination,
  routePoints,
  unsafeSegments,
  streetLights,
  follow,
}: {
  userLocation: Coordinates;
  destination: { label: string; coords: Coordinates };
  routePoints: Array<[number, number]>;
  unsafeSegments: UnsafeRouteSegment[];
  streetLights: NairobiLayers["streetLights"];
  follow: boolean;
}) => {
  const AnyMapContainer = MapContainer as unknown as ComponentType<Record<string, unknown>>;
  const AnyTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
  const AnyPolyline = Polyline as unknown as ComponentType<Record<string, unknown>>;
  const AnyCircleMarker = CircleMarker as unknown as ComponentType<Record<string, unknown>>;
  const AnyPopup = Popup as unknown as ComponentType<Record<string, unknown>>;
  const AnyFollower = MapFollower as unknown as ComponentType<Record<string, unknown>>;

  return (
    <div className="lm-nav-map-wrap">
      <AnyMapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} style={{ height: 510, width: "100%" }}>
        <AnyTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {follow ? <AnyFollower lat={userLocation.lat} lng={userLocation.lng} /> : null}

        <AnyPolyline positions={routePoints} pathOptions={{ color: "#27c9ff", weight: 7, opacity: 0.9 }} />
        <AnyPolyline positions={routePoints} pathOptions={{ color: "#facc15", weight: 2, opacity: 0.8, dashArray: "10,10" }} />
        {unsafeSegments.map((segment, index) => (
          <AnyPolyline
            key={`${segment.riskLevel}-${index}`}
            positions={segment.coordinates.map((point) => [point.lat, point.lng])}
            pathOptions={{
              color: segment.riskLevel === "high" ? "#ef4444" : "#f97316",
              weight: segment.riskLevel === "high" ? 8 : 6,
              opacity: 0.85,
            }}
          />
        ))}
        {streetLights.map((light) => (
          <AnyCircleMarker
            key={light.id}
            center={[light.lat, light.lng]}
            radius={light.status === "functional" ? 4 : 5}
            pathOptions={{
              color: light.status === "functional" ? "#22c55e" : "#f97316",
              fillColor: light.status === "functional" ? "#22c55e" : "#f97316",
              fillOpacity: 0.9,
            }}
          >
            <AnyPopup>
              <div>
                <strong>Streetlight</strong>
                <p>Status: {light.status}</p>
                <p>Condition: {light.conditionLabel}</p>
                <p>Source: {light.source}</p>
              </div>
            </AnyPopup>
          </AnyCircleMarker>
        ))}

        <AnyCircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={14}
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2, className: "lm-live-pulse" }}
        />
        <AnyCircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={6}
          pathOptions={{ color: "#fff", fillColor: "#ef4444", fillOpacity: 1, className: "lm-live-core" }}
        >
          <AnyPopup>Your live location</AnyPopup>
        </AnyCircleMarker>

        <AnyCircleMarker
          center={[destination.coords.lat, destination.coords.lng]}
          radius={7}
          pathOptions={{ color: "#fff", fillColor: "#2563eb", fillOpacity: 0.95 }}
        >
          <AnyPopup>{destination.label}</AnyPopup>
        </AnyCircleMarker>
      </AnyMapContainer>
    </div>
  );
};

import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { ComponentType } from "react";
import type { NairobiLayers } from "../../SERVICES/mapService";
import { useAppContext } from "../../CONTEXT/AppContext";

const MapFollower = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    const nextZoom = map.getZoom() < 14 ? 14 : map.getZoom();
    map.setView([lat, lng], nextZoom, { animate: true, duration: 0.8 });
  }, [lat, lng, map]);

  return null;
};

export const NairobiMap = ({ layers, showControls = true }: { layers: NairobiLayers | null; showControls?: boolean }) => {
  const center = layers?.center ?? { lat: -1.286389, lng: 36.817223, label: "Nairobi CBD" };
  const { userLocation, isLocationApproximate } = useAppContext();
  const [showStreetLights, setShowStreetLights] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [followLiveLocation, setFollowLiveLocation] = useState(true);

  const AnyMapContainer = MapContainer as unknown as ComponentType<Record<string, unknown>>;
  const AnyTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
  const AnyCircle = Circle as unknown as ComponentType<Record<string, unknown>>;
  const AnyCircleMarker = CircleMarker as unknown as ComponentType<Record<string, unknown>>;
  const AnyPopup = Popup as unknown as ComponentType<Record<string, unknown>>;
  const AnyFollower = MapFollower as unknown as ComponentType<Record<string, unknown>>;

  const severityColor = (severity?: string) => {
    if (severity === "high") return "#ef4444";
    if (severity === "medium") return "#f59e0b";
    return "#22c55e";
  };

  const heatRadius = (severity?: string) => {
    if (severity === "high") return 650;
    if (severity === "medium") return 420;
    return 260;
  };

  return (
    <div className="lm-leaflet-wrap">
      {showControls ? (
        <div className="lm-map-controls">
          <label>
            <input type="checkbox" checked={showStreetLights} onChange={(e) => setShowStreetLights(e.target.checked)} />
            Streetlights
          </label>
          <label>
            <input type="checkbox" checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} />
            Crime markers
          </label>
          <label>
            <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
            Heat zones
          </label>
          <label>
            <input type="checkbox" checked={followLiveLocation} onChange={(e) => setFollowLiveLocation(e.target.checked)} />
            Follow me
          </label>
        </div>
      ) : null}

      <AnyMapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: 360, width: "100%" }}>
        <AnyTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {followLiveLocation ? <AnyFollower lat={userLocation.lat} lng={userLocation.lng} /> : null}

        {showStreetLights && (layers?.streetLights ?? []).map((light) => (
          <AnyCircleMarker
            key={light.id}
            center={[light.lat, light.lng]}
            radius={light.status === "functional" ? 5 : 6}
            pathOptions={{ color: light.status === "functional" ? "#22c55e" : "#f59e0b", fillOpacity: 0.95 }}
          >
            <AnyPopup>
              <div>
                <strong>Streetlight</strong>
                <p>Status: {light.status}</p>
                <p>Condition: {light.conditionLabel}</p>
                <p>Source: {light.source}</p>
                {light.notes ? <p>Notes: {light.notes}</p> : null}
                <p>Lat: {light.lat.toFixed(5)}, Lng: {light.lng.toFixed(5)}</p>
              </div>
            </AnyPopup>
          </AnyCircleMarker>
        ))}

        {showHeatmap && (layers?.dangerZones ?? []).map((zone) => (
          <AnyCircle
            key={`heat-${zone.id}`}
            center={[zone.lat, zone.lng]}
            radius={heatRadius(zone.severity)}
            pathOptions={{
              color: severityColor(zone.severity),
              fillColor: severityColor(zone.severity),
              fillOpacity: zone.severity === "high" ? 0.22 : zone.severity === "medium" ? 0.16 : 0.12,
              weight: 0,
            }}
          />
        ))}

        {showIncidents && (layers?.dangerZones ?? []).map((zone) => (
          <AnyCircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={9}
            pathOptions={{ color: severityColor(zone.severity), fillColor: severityColor(zone.severity), fillOpacity: 0.65 }}
          >
            <AnyPopup>
              <div>
                <p><strong>{zone.crimeType ?? "incident"}</strong></p>
                <p>{zone.locationName ?? "Nairobi"}</p>
                <p>{zone.createdAt ? new Date(zone.createdAt).toLocaleString() : "Now"}</p>
              </div>
            </AnyPopup>
          </AnyCircleMarker>
        ))}

        <AnyCircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={16}
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.18, className: "lm-live-pulse" }}
        />
        <AnyCircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={6}
          pathOptions={{ color: "#ffffff", weight: 1.2, fillColor: "#ef4444", fillOpacity: 0.95, className: "lm-live-core" }}
        >
          <AnyPopup>
            <div>
              <strong>Your live location</strong>
              <p>{isLocationApproximate ? "Approximate GPS fix" : "High-accuracy live GPS"}</p>
              <p>Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)}</p>
            </div>
          </AnyPopup>
        </AnyCircleMarker>
      </AnyMapContainer>
    </div>
  );
};

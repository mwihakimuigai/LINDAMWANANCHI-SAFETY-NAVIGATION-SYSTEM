import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { facilitiesService } from "../SERVICES/facilitiesService";

const NearbyServicesMap = dynamic(
  () => import("../COMPONENTS/MAP/NearbyServicesMap").then((m) => m.NearbyServicesMap),
  { ssr: false }
);

export default function NearbyPage() {
  const { userLocation, locationPermission } = useAppContext();
  const hasLiveLocation = locationPermission === "granted";

  const allFacilities = useMemo(() => facilitiesService.listAll(), []);
  const nearbyFacilities = useMemo(() => facilitiesService.listNearby(userLocation), [userLocation]);
  const facilities = hasLiveLocation ? nearbyFacilities : allFacilities;
  const police = hasLiveLocation
    ? nearbyFacilities.filter((item) => item.type === "police")
    : allFacilities.filter((item) => item.type === "police");
  const hospitals = hasLiveLocation
    ? nearbyFacilities.filter((item) => item.type === "hospital")
    : allFacilities.filter((item) => item.type === "hospital");

  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Nearby Services</h1>
        <p className="lm-meta">
          {hasLiveLocation
            ? "Showing nearest police stations and hospitals based on your live location."
            : "Live location is off. Showing all police stations and hospitals."}
        </p>
      </section>

      <section className="lm-grid">
        <section className="lm-panel">
          <h2>Police Stations</h2>
          <div className="lm-service-list">
            {police.map((item) => (
              <article key={item.id} className="lm-service-item police">
                <strong>{item.name}</strong>
                <p>{item.area}</p>
                {hasLiveLocation && "distanceKm" in item ? <small>{Number(item.distanceKm).toFixed(2)} km away</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="lm-panel">
          <h2>Hospitals</h2>
          <div className="lm-service-list">
            {hospitals.map((item) => (
              <article key={item.id} className="lm-service-item hospital">
                <strong>{item.name}</strong>
                <p>{item.area}</p>
                {hasLiveLocation && "distanceKm" in item ? <small>{Number(item.distanceKm).toFixed(2)} km away</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="lm-panel lm-wide">
          <h2>Services Map</h2>
          <NearbyServicesMap facilities={facilities} userLocation={userLocation} hasLiveLocation={hasLiveLocation} />
        </section>
      </section>
    </main>
  );
}

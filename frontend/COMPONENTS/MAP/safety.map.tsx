import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../CONTEXT/AppContext";
import { mapService, type NairobiLayers } from "../../SERVICES/mapService";
import { sosService } from "../../SERVICES/sosService";

const NairobiMap = dynamic(() => import("./NairobiMap").then((m) => m.NairobiMap), { ssr: false });

const crimeGuides: Record<string, string[]> = {
  rape: [
    "Move to immediate safety and call a trusted person.",
    "Do not wash or change clothes if possible to preserve evidence.",
    "Go to the nearest hospital immediately for medical care and PEP.",
    "Report to police and request a P3 form.",
    "Contact a GBV support center for counselling and legal support.",
  ],
  theft: [
    "Move away from danger and note suspect details safely.",
    "Call police hotline and lock your mobile banking immediately.",
    "Report with exact location and time.",
    "Check nearby CCTV or witness statements.",
  ],
  violence: [
    "Leave the scene immediately and seek shelter.",
    "Call emergency responders and request assistance.",
    "Document injuries and scene details where safe.",
    "File a formal report for legal protection.",
  ],
};

const features = [
  { id: "report", label: "Report Incident", href: "/reports", icon: "RI" },
  { id: "sos", label: "Emergency SOS", href: "#sos", icon: "SOS" },
  { id: "map", label: "Nairobi Map", href: "#map", icon: "MAP" },
  { id: "alerts", label: "Safety Alerts", href: "#alerts", icon: "AL" },
  { id: "guide", label: "Crime Guide", href: "#guide", icon: "GD" },
];

export const SafetyMap = () => {
  const { alerts, destination, incidents, loading, routes, setDestination, user, userLocation, isLocationApproximate } = useAppContext();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [guideType, setGuideType] = useState<keyof typeof crimeGuides>("rape");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [sosProgress, setSosProgress] = useState(0);
  const [layers, setLayers] = useState<NairobiLayers | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mapService.getNairobiLayers().then(setLayers);
    sosService.getContact(1).then((saved) => {
      if (saved) {
        setContactName(saved.contact_name);
        setContactPhone(saved.contact_phone);
      }
    });
  }, []);

  const bestRoute = useMemo(() => routes.find((route) => route.id === selectedRouteId) ?? routes[0], [routes, selectedRouteId]);
  const highRiskCount = useMemo(
    () => incidents.filter((incident) => incident.severity === "high").length,
    [incidents]
  );

  const activateSos = async () => {
    if (!contactPhone) {
      setContactStatus("Set emergency contact first.");
      return;
    }
    try {
      await sosService.trigger({ userId: 1, message: "SOS from LINDAMWANANCHI SAFETY NAVIGATION SYSTEM dashboard" });
      setContactStatus("SOS sent. Calling emergency contact...");
      window.location.href = `tel:${contactPhone}`;
    } catch {
      setContactStatus("SOS failed. Check backend and try again.");
    }
  };

  const startHold = () => {
    setSosProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSosProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          void activateSos();
          return 100;
        }
        return next;
      });
    }, 90);
  };

  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSosProgress(0);
  };

  const saveContact = async () => {
    if (!contactName || !contactPhone) {
      setContactStatus("Add name and phone number first.");
      return;
    }
    await sosService.setContact({
      userId: 1,
      contactName,
      contactPhone,
      relationship: "Emergency Contact",
    });
    setContactStatus("Emergency contact saved.");
  };

  return (
    <main className="lm-dashboard">
      <header className="lm-header">
        <div>
            <p className="lm-brand">LINDAMWANANCHI SAFETY NAVIGATION SYSTEM</p>
          <h1>Welcome, {user?.displayName ?? "Citizen"}.</h1>
        </div>
        <div className="lm-header-stats">
          <span>
            GPS {isLocationApproximate ? "Approx" : "Live"}: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
          <span>{incidents.length} incidents</span>
          <span>{alerts.length} alerts</span>
          <span>{loading ? "Syncing..." : "Live"}</span>
        </div>
      </header>

      <section className="lm-feature-icons">
        {features.map((feature) => (
          <a key={feature.id} href={feature.href} className="lm-feature-card">
            <span className="lm-feature-icon">{feature.icon}</span>
            <strong>{feature.label}</strong>
          </a>
        ))}
      </section>

      <section className="lm-grid">
        <section id="map" className="lm-panel lm-route-panel">
          <h2>Nairobi Safe Navigation Map</h2>
          <div className="lm-route-controls">
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
            <button type="button" onClick={() => setSelectedRouteId(bestRoute?.id ?? "")}>Find Safe Route</button>
          </div>
          <div className="lm-route-list">
            {routes.map((route) => (
              <button
                key={route.id}
                className={`lm-route-item ${route.id === bestRoute?.id ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
              >
                <strong>{route.name}</strong>
                <span>{route.distanceKm}km - {route.etaMinutes}min - risk {route.riskScore}%</span>
                {route.aiInsights ? (
                  <small>
                    AI: {route.aiInsights.pendingIncidents} incidents, {route.aiInsights.brokenLights} broken lights
                  </small>
                ) : null}
              </button>
            ))}
          </div>
          <NairobiMap layers={layers} />
          <p className="lm-meta">
            Green points: functional lights. Yellow points: broken lights. Red markers: danger zones.
          </p>
        </section>

        <section id="alerts" className="lm-panel">
          <h2>Recent Alerts</h2>
          <div className="lm-alert-list">
            {alerts.map((alert) => (
              <article key={alert.id} className={`lm-alert lm-${alert.level}`}>
                <strong>{alert.level.toUpperCase()}</strong>
                <p>{alert.message}</p>
              </article>
            ))}
          </div>
          <p className="lm-meta">High-risk signals now: {highRiskCount}</p>
        </section>

        <section id="sos" className="lm-panel">
          <h2>Emergency SOS</h2>
          <div className="lm-contact-form">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Emergency contact name" />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Emergency contact phone" />
            <button type="button" onClick={saveContact}>Save Contact</button>
          </div>
          <button
            className="lm-sos-button"
            type="button"
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
          >
            HOLD TO ACTIVATE SOS
            <span style={{ width: `${sosProgress}%` }} />
          </button>
          <p className="lm-meta">{contactStatus || "Press and hold to trigger emergency contact call."}</p>
        </section>

        <section id="guide" className="lm-panel">
          <h2>What To Do After {guideType.toUpperCase()}</h2>
          <div className="lm-guide-tabs">
            {Object.keys(crimeGuides).map((type) => (
              <button key={type} type="button" onClick={() => setGuideType(type as keyof typeof crimeGuides)}>
                {type}
              </button>
            ))}
          </div>
          <ol className="lm-guide-list">
            {crimeGuides[guideType].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="lm-panel lm-wide">
          <h2>My Reports</h2>
          <div className="lm-reports-list">
            {incidents.map((incident) => (
              <article key={incident.id}>
                <strong>{incident.title}</strong>
                <span>{incident.locationName}</span>
                <small>{incident.status ?? "pending"}</small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
};

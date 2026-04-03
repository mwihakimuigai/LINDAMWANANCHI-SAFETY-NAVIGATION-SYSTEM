import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { sosService } from "../SERVICES/sosService";

export default function SosPage() {
  const { user, userLocation } = useAppContext();
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    const loadContact = async () => {
      if (!user?.id) return;
      const contact = await sosService.getContact(Number(user.id));
      if (!active || !contact) return;
      setContactName(contact.contact_name);
      setContactPhone(contact.contact_phone);
      setStatus(`Emergency contact loaded for ${contact.contact_name}.`);
    };

    void loadContact();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const trigger = async () => {
    if (!contactPhone || !user?.id) {
      setStatus("Add and save an emergency contact first.");
      return;
    }

    try {
      await sosService.trigger({
        userId: Number(user.id),
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        message: "Emergency SOS trigger from dedicated SOS page",
      });
      setStatus(`SOS sent. Opening call action for ${contactName || contactPhone}...`);
      window.location.href = `tel:${contactPhone.replace(/\s+/g, "")}`;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to trigger SOS.");
    }
  };

  const startHold = () => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          void trigger();
          return 100;
        }
        return next;
      });
    }, 90);
  };

  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  const save = async () => {
    if (!contactName || !contactPhone || !user?.id) {
      setStatus("Add both the contact name and phone number first.");
      return;
    }

    setSaving(true);
    try {
      await sosService.setContact({
        userId: Number(user.id),
        contactName,
        contactPhone,
        relationship: "Emergency Contact",
      });
      setStatus("Emergency contact saved. Press and hold SOS to call them immediately.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save emergency contact.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Emergency SOS</h1>
        <p className="lm-meta">Press and hold SOS to notify and immediately open a call action for your saved emergency contact.</p>
        <div className="lm-contact-form">
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" />
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone" />
          <button type="button" onClick={() => void save()}>
            {saving ? "Saving..." : "Save Contact"}
          </button>
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
          <span style={{ width: `${progress}%` }} />
        </button>
        <p className="lm-meta">
          {status || "Stay calm. Hold the button to trigger the emergency log and call your saved contact."}
        </p>
      </section>
    </main>
  );
}

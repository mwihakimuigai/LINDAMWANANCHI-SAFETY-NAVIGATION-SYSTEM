import { useMemo, useRef, useState } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { incidentsService } from "../SERVICES/incidentsService";

const severityByType = {
  theft: "medium",
  harassment: "high",
  violence: "high",
  medical: "medium",
  road: "medium",
} as const;

export default function ReportsPage() {
  const { incidents, userLocation, isLocationApproximate, user } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [type, setType] = useState<"theft" | "harassment" | "violence" | "medical" | "road">("theft");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("Live location");
  const [title, setTitle] = useState("Theft incident report");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const recentUserReports = useMemo(
    () => incidents.filter((incident) => incident.reportedBy === user?.id || incident.source === "user"),
    [incidents, user?.id]
  );

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (!file) {
      setPreviewUrl("");
      return;
    }

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
    setStatus(`Selected ${file.name}`);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      setStatus("Please add a short title and description before submitting.");
      return;
    }
    if (!user) {
      setStatus("Please sign in again before reporting an incident.");
      return;
    }

    setSubmitting(true);
    try {
      await incidentsService.createIncident({
        title: title.trim(),
        description: description.trim(),
        type,
        severity: severityByType[type],
        locationName: locationName.trim() || "Live location",
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        photo: selectedFile?.name,
      });
      setStatus("Incident report submitted successfully. It should appear in your reports shortly.");
      setDescription("");
      setTitle(`${type.charAt(0).toUpperCase()}${type.slice(1)} incident report`);
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="lm-report-page">
      <section className="lm-panel">
        <h1>Report an Incident</h1>
        <p className="lm-meta">You can now pick a photo or video from your device before submitting a report.</p>
        <label>
          Report Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short incident title" />
        </label>
        <label>
          Incident Type
          <select
            value={type}
            onChange={(e) => {
              const nextType = e.target.value as typeof type;
              setType(nextType);
              setTitle(`${nextType.charAt(0).toUpperCase()}${nextType.slice(1)} incident report`);
            }}
          >
            <option value="theft">Theft</option>
            <option value="harassment">Harassment</option>
            <option value="violence">Violence</option>
            <option value="medical">Medical</option>
            <option value="road">Road Accident</option>
          </select>
        </label>
        <label>
          Location
          <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Street, building, landmark, or estate" />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, location landmarks, and suspect details."
          />
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
        <button type="button" className="lm-upload" onClick={openPicker}>
          {selectedFile ? `Selected: ${selectedFile.name}` : "Upload Photo / Video"}
        </button>

        {previewUrl ? (
          <div className="lm-report-preview">
            <img src={previewUrl} alt="Incident preview" />
          </div>
        ) : selectedFile ? (
          <div className="lm-report-preview lm-report-preview-file">
            <strong>{selectedFile.name}</strong>
            <p className="lm-meta">Video selected successfully and ready with this report.</p>
          </div>
        ) : null}

        <div className="lm-mini-map">
          <svg viewBox="0 0 400 160">
            <rect width="400" height="160" fill="#111b31" />
            <circle cx="230" cy="80" r="10" fill="#f97316" />
            <text x="20" y="24" fill="#d8e6ff" fontSize="15">
              {isLocationApproximate ? "Approximate live location attached" : "Live location attached"}
            </text>
            <text x="20" y="48" fill="#8ea7cb" fontSize="12">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </text>
          </svg>
        </div>
        <button type="button" onClick={() => void submit()}>
          {submitting ? "Submitting Report..." : "Submit Report"}
        </button>
        <p className="lm-meta">{status || "Reports use your current live location to help map the incident correctly."}</p>
      </section>

      <section className="lm-panel">
        <h2>My Reports</h2>
        <div className="lm-reports-list">
          {recentUserReports.map((incident) => (
            <article key={incident.id}>
              <strong>{incident.title}</strong>
              <span>{incident.locationName}</span>
              <small>{incident.status ?? "pending"}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

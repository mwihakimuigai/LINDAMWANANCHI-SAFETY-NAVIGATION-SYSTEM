const guides = [
  {
    key: "rape",
    title: "Rape / Sexual Assault",
    className: "lm-guide-rape",
    steps: [
      "Move to a safe place and call a trusted person.",
      "Seek urgent medical care and request PEP immediately.",
      "Preserve evidence as much as possible before washing.",
      "Report to police and request legal documentation.",
      "Get psychosocial support and counselling follow-up.",
    ],
  },
  {
    key: "theft",
    title: "Theft / Robbery",
    className: "lm-guide-theft",
    steps: [
      "Prioritize personal safety and avoid confrontation.",
      "Call police and share suspect direction or plate details.",
      "Block cards and mobile money accounts immediately.",
      "File an official report and keep the reference number.",
    ],
  },
  {
    key: "assault",
    title: "Physical Assault",
    className: "lm-guide-assault",
    steps: [
      "Get away from the attacker and move to a secure area.",
      "Call emergency responders and request immediate support.",
      "Seek treatment and request a medical injury report.",
      "Record timeline, witnesses, and scene details for police.",
    ],
  },
  {
    key: "kidnap",
    title: "Kidnapping Threat",
    className: "lm-guide-kidnap",
    steps: [
      "Call police emergency line immediately.",
      "Share last known location, vehicle details, and time.",
      "Preserve call logs, messages, and CCTV footage if available.",
      "Coordinate updates through one trusted family focal person.",
    ],
  },
  {
    key: "accident",
    title: "Traffic Accident",
    className: "lm-guide-accident",
    steps: [
      "Secure the scene and switch on hazard warning if safe.",
      "Call emergency and traffic responders with exact location.",
      "Assist injured persons only within safe first-aid limits.",
      "Document vehicle details, witnesses, and crash images.",
    ],
  },
  {
    key: "fire",
    title: "Fire Incident",
    className: "lm-guide-fire",
    steps: [
      "Evacuate immediately and do not use elevators.",
      "Call fire response and share building/landmark details.",
      "Keep low to avoid smoke inhalation while exiting.",
      "Gather at a safe point and account for missing persons.",
    ],
  },
  {
    key: "cybercrime",
    title: "Cybercrime / Scam",
    className: "lm-guide-cybercrime",
    steps: [
      "Stop communication with the scammer immediately.",
      "Freeze compromised accounts and change passwords.",
      "Report to relevant cybercrime authorities and your bank.",
      "Keep screenshots, transaction IDs, and phone numbers.",
    ],
  },
  {
    key: "gbv",
    title: "Domestic / GBV Case",
    className: "lm-guide-gbv",
    steps: [
      "Move survivor to a safe and private location.",
      "Contact police, GBV desk, or rescue hotline urgently.",
      "Arrange medical care and collect required legal forms.",
      "Connect survivor to shelter and counselling services.",
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Crime Response Guide</h1>
        <p className="lm-meta">Each crime type has its own response widget for quick action.</p>
        <div className="lm-guide-widget-grid">
          {guides.map((guide) => (
            <article key={guide.key} className={`lm-guide-widget ${guide.className}`}>
              <h3>{guide.title}</h3>
              <ol className="lm-guide-list">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

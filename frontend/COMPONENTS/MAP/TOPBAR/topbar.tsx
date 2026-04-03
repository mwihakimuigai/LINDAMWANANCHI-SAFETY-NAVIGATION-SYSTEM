type TopbarProps = {
  destination: string;
  onDestinationChange: (value: string) => void;
};

export const Topbar = ({ destination, onDestinationChange }: TopbarProps) => {
  return (
    <header className="lm-topbar">
      <div>
      <h1>LINDAMWANANCHI SAFETY NAVIGATION SYSTEM</h1>
        <p>Safety navigation for citizens, responders, and communities.</p>
      </div>
      <label>
        Destination
        <input
          value={destination}
          onChange={(event) => onDestinationChange(event.target.value)}
          placeholder="Enter destination"
        />
      </label>
    </header>
  );
};

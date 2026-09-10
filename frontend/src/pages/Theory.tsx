import { StationHeader } from "../components/layout/StationHeader";
import { BDHModule } from "../components/BDHModule";
import "../components/panel.css";

export function Theory() {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 07 // THEORY & SOURCES"
        title="Fast Weights \u2192 BDH: Theoretical Grounding"
        subtitle="How this mechanism relates to Pathway's Dragon Hatchling architecture, with real, verified sources -- not invented citations."
      />
      <BDHModule />
    </div>
  );
}

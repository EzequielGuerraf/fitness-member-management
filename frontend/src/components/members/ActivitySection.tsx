import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { formatDateTime } from "../../utils/format";

interface ActivitySectionProps {
  lastCheckInAt: string | null;
  checkInCountLast30Days: number;
}

export function ActivitySection({
  lastCheckInAt,
  checkInCountLast30Days,
}: ActivitySectionProps) {
  return (
    <Section
      title="Activity"
      description="Latest attendance indicators from the member summary."
    >
      <Card>
        <div className="metric-grid">
          <div className="metric-card">
            <p className="metric-card__label">Last check-in</p>
            <p className="metric-card__value">
              {lastCheckInAt ? formatDateTime(lastCheckInAt) : "No check-ins"}
            </p>
          </div>
          <div className="metric-card">
            <p className="metric-card__label">Last 30 days</p>
            <p className="metric-card__value">
              {checkInCountLast30Days} check-ins
            </p>
          </div>
        </div>
      </Card>
    </Section>
  );
}
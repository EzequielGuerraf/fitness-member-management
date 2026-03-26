import { Button } from "../ui/Button";
import { FormError } from "../ui/FormError";
import { StatusPill } from "../ui/StatusPill";
import { formatDateTime } from "../../utils/format";

interface RecordCheckInPanelProps {
  hasActiveMembership: boolean;
  activeMembershipPlanName?: string;
  lastCheckInAt: string | null;
  checkInCountLast30Days: number;
  isRefreshing: boolean;
  error: string | null;
  isSubmitting: boolean;
  onRecord: () => void;
}

export function RecordCheckInPanel({
  hasActiveMembership,
  activeMembershipPlanName,
  lastCheckInAt,
  checkInCountLast30Days,
  isRefreshing,
  error,
  isSubmitting,
  onRecord,
}: RecordCheckInPanelProps) {
  return (
    <article className="action-panel">
      <div className="action-panel__header">
        <div>
          <h3 className="action-panel__title">Record check-in</h3>
          <p className="action-panel__description">
            Attendance is allowed only while the member has an active membership.
          </p>
        </div>
        <StatusPill
          label={hasActiveMembership ? "Ready" : "Unavailable"}
          tone={hasActiveMembership ? "positive" : "neutral"}
        />
      </div>

      <div className="action-panel__details">
        <p className="action-panel__meta">
          Active plan:{" "}
          <strong>
            {activeMembershipPlanName ?? "No active membership"}
          </strong>
        </p>
        <p className="action-panel__meta">
          Last check-in:{" "}
          <strong>
            {lastCheckInAt ? formatDateTime(lastCheckInAt) : "No check-ins"}
          </strong>
        </p>
        <p className="action-panel__meta">
          Last 30 days:{" "}
          <strong>{checkInCountLast30Days} check-ins</strong>
        </p>
      </div>

      <p className="action-form__note">
        {hasActiveMembership
          ? "Use this to register the member's next visit."
          : "Activate a membership before recording a check-in."}
      </p>

      <FormError message={error} />

      <div className="action-form__actions">
        <Button
          disabled={!hasActiveMembership || isSubmitting || isRefreshing}
          onClick={onRecord}
        >
          {isSubmitting ? "Recording..." : "Record check-in"}
        </Button>
      </div>
    </article>
  );
}
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { FormError } from "../ui/FormError";
import { Input } from "../ui/Input";
import { StatusPill } from "../ui/StatusPill";
import { formatDate } from "../../utils/format";

interface CancelMembershipPanelProps {
  hasActiveMembership: boolean;
  activeMembershipPlanName?: string;
  activeMembershipStatus?: string;
  activeMembershipStartDate?: string;
  isRefreshing: boolean;
  values: { effectiveDate: string };
  errors: { effectiveDate?: string };
  formError: string | null;
  isSubmitting: boolean;
  onFieldChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  todayDateValue: string;
}

export function CancelMembershipPanel({
  hasActiveMembership,
  activeMembershipPlanName,
  activeMembershipStatus,
  activeMembershipStartDate,
  isRefreshing,
  values,
  errors,
  formError,
  isSubmitting,
  onFieldChange,
  onSubmit,
  todayDateValue,
}: CancelMembershipPanelProps) {
  return (
    <article className="action-panel">
      <div className="action-panel__header">
        <div>
          <h3 className="action-panel__title">Cancel membership</h3>
          <p className="action-panel__description">
            Record the effective cancellation date for the active membership.
          </p>
        </div>
        <StatusPill
          label={hasActiveMembership ? "Ready" : "Unavailable"}
          tone={hasActiveMembership ? "warning" : "neutral"}
        />
      </div>

      <form className="action-form" noValidate onSubmit={onSubmit}>
        <div className="action-panel__details">
          <p className="action-panel__meta">
            Active plan:{" "}
            <strong>
              {activeMembershipPlanName ?? "No active membership"}
            </strong>
          </p>
          <p className="action-panel__meta">
            Current status:{" "}
            <strong>{activeMembershipStatus ?? "N/A"}</strong>
          </p>
        </div>

        <Field
          error={errors.effectiveDate}
          htmlFor="cancel-effective-date"
          label="Effective date"
        >
          <Input
            disabled={!hasActiveMembership || isSubmitting || isRefreshing}
            hasError={Boolean(errors.effectiveDate)}
            id="cancel-effective-date"
            max={todayDateValue}
            min={activeMembershipStartDate}
            onChange={(event) => onFieldChange(event.target.value)}
            type="date"
            value={values.effectiveDate}
          />
        </Field>

        <p className="action-form__note">
          {activeMembershipStartDate
            ? `The effective date must be on or after ${formatDate(
                activeMembershipStartDate
              )}.`
            : "This member has no active membership to cancel."}
        </p>

        <FormError message={formError} />

        <div className="action-form__actions">
          <Button
            disabled={!hasActiveMembership || isSubmitting || isRefreshing}
            type="submit"
            variant="secondary"
          >
            {isSubmitting ? "Canceling..." : "Cancel membership"}
          </Button>
        </div>
      </form>
    </article>
  );
}
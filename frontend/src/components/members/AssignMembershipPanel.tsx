import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { FormError } from "../ui/FormError";
import { Input } from "../ui/Input";
import { LoadingState } from "../ui/LoadingState";
import { Select } from "../ui/Select";
import { StatusPill } from "../ui/StatusPill";
import type { MembershipPlan } from "../../types/plans";
import { formatBillingPeriod, formatCurrencyFromCents } from "../../utils/format";

interface AssignMembershipPanelProps {
  plans: MembershipPlan[];
  plansErrorMessage: string | null;
  isPlansLoading: boolean;
  hasActiveMembership: boolean;
  activeMembershipPlanName?: string;
  isRefreshing: boolean;
  values: { planId: string; startDate: string };
  errors: { planId?: string; startDate?: string };
  formError: string | null;
  isSubmitting: boolean;
  onFieldChange: (field: "planId" | "startDate", value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRetryPlans: () => void;
  todayDateValue: string;
}

export function AssignMembershipPanel({
  plans,
  plansErrorMessage,
  isPlansLoading,
  hasActiveMembership,
  activeMembershipPlanName,
  isRefreshing,
  values,
  errors,
  formError,
  isSubmitting,
  onFieldChange,
  onSubmit,
  onRetryPlans,
  todayDateValue,
}: AssignMembershipPanelProps) {
  return (
    <article className="action-panel">
      <div className="action-panel__header">
        <div>
          <h3 className="action-panel__title">Assign plan</h3>
          <p className="action-panel__description">
            Start a new membership with a required start date.
          </p>
        </div>
        <StatusPill
          label={hasActiveMembership ? "Blocked" : "Ready"}
          tone={hasActiveMembership ? "warning" : "positive"}
        />
      </div>

      {isPlansLoading ? (
        <LoadingState label="Loading active plans..." />
      ) : plansErrorMessage ? (
        <div className="stack">
          <FormError message={plansErrorMessage} />
          <div className="action-form__actions">
            <Button onClick={onRetryPlans} variant="secondary">
              Retry plans
            </Button>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <p className="action-form__note">
          No active plans are available.{" "}
          <Link className="inline-link" to="/plans">
            Create a plan
          </Link>{" "}
          before assigning a membership.
        </p>
      ) : (
        <form className="action-form" noValidate onSubmit={onSubmit}>
          <Field error={errors.planId} htmlFor="assign-plan-id" label="Plan">
            <Select
              disabled={hasActiveMembership || isSubmitting || isRefreshing}
              hasError={Boolean(errors.planId)}
              id="assign-plan-id"
              onChange={(event) => onFieldChange("planId", event.target.value)}
              value={values.planId}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} | {formatBillingPeriod(plan.billingPeriod)} |{" "}
                  {formatCurrencyFromCents(plan.priceCents)}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            error={errors.startDate}
            htmlFor="assign-start-date"
            label="Start date"
          >
            <Input
              disabled={hasActiveMembership || isSubmitting || isRefreshing}
              hasError={Boolean(errors.startDate)}
              id="assign-start-date"
              max={todayDateValue}
              onChange={(event) =>
                onFieldChange("startDate", event.target.value)
              }
              type="date"
              value={values.startDate}
            />
          </Field>

          <p className="action-form__note">
            {hasActiveMembership && activeMembershipPlanName
              ? `This member already has ${activeMembershipPlanName} active. Cancel it before assigning a new plan.`
              : "A member can have at most one active membership at a time."}
          </p>

          <FormError message={formError} />

          <div className="action-form__actions">
            <Button
              disabled={hasActiveMembership || isSubmitting || isRefreshing}
              type="submit"
            >
              {isSubmitting ? "Assigning..." : "Assign membership"}
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}
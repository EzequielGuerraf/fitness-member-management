import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ApiClientError, getErrorMessage } from "../api/client";
import {
  assignMembershipToMember,
  cancelMembershipForMember,
  fetchMemberSummary,
  recordMemberCheckIn
} from "../api/members";
import { fetchPlans } from "../api/plans";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Field } from "../components/ui/Field";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { Select } from "../components/ui/Select";
import { StatusPill } from "../components/ui/StatusPill";
import type { MemberSummary } from "../types/members";
import type { MembershipPlan } from "../types/plans";
import {
  formatBillingPeriod,
  formatCurrencyFromCents,
  formatDate,
  formatDateTime,
  formatMemberName
} from "../utils/format";

interface MemberSummaryLocationState {
  successMessage?: string;
}

interface AssignMembershipFormValues {
  planId: string;
  startDate: string;
}

interface AssignMembershipFormErrors {
  planId?: string;
  startDate?: string;
}

interface CancelMembershipFormValues {
  effectiveDate: string;
}

interface CancelMembershipFormErrors {
  effectiveDate?: string;
}

interface ActionNoticeState {
  description: string;
  title: string;
}

const getTodayDateValue = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const validateAssignMembershipForm = (
  values: AssignMembershipFormValues,
  todayDateValue: string
): AssignMembershipFormErrors => {
  const errors: AssignMembershipFormErrors = {};

  if (!values.planId) {
    errors.planId = "Select an active plan.";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required.";
  } else if (values.startDate > todayDateValue) {
    errors.startDate = "Start date cannot be in the future.";
  }

  return errors;
};

const validateCancelMembershipForm = (
  values: CancelMembershipFormValues,
  activeMembershipStartDate: string | null,
  todayDateValue: string
): CancelMembershipFormErrors => {
  const errors: CancelMembershipFormErrors = {};

  if (!values.effectiveDate) {
    errors.effectiveDate = "Cancellation effective date is required.";
  } else if (values.effectiveDate > todayDateValue) {
    errors.effectiveDate = "Cancellation effective date cannot be in the future.";
  } else if (
    activeMembershipStartDate &&
    values.effectiveDate < activeMembershipStartDate
  ) {
    errors.effectiveDate =
      "Cancellation effective date cannot be earlier than the membership start date.";
  }

  return errors;
};

export function MemberSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state as MemberSummaryLocationState | null;
  const [member, setMember] = useState<MemberSummary | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plansErrorMessage, setPlansErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [plansReloadKey, setPlansReloadKey] = useState(0);
  const [assignValues, setAssignValues] = useState<AssignMembershipFormValues>({
    planId: "",
    startDate: getTodayDateValue()
  });
  const [assignErrors, setAssignErrors] = useState<AssignMembershipFormErrors>(
    {}
  );
  const [assignFormError, setAssignFormError] = useState<string | null>(null);
  const [cancelValues, setCancelValues] = useState<CancelMembershipFormValues>({
    effectiveDate: getTodayDateValue()
  });
  const [cancelErrors, setCancelErrors] = useState<CancelMembershipFormErrors>(
    {}
  );
  const [cancelFormError, setCancelFormError] = useState<string | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<ActionNoticeState | null>(
    null
  );
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [isCheckInSubmitting, setIsCheckInSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setMember(null);
      setErrorMessage("The requested member id is missing.");
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    setMember((currentMember) =>
      currentMember?.id === id ? currentMember : null
    );
    setIsLoading(true);
    setErrorMessage(null);

    void fetchMemberSummary(id, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setMember(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          getErrorMessage(
            error,
            "We could not load the member summary. Please try again."
          )
        );
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [id, reloadKey]);

  useEffect(() => {
    const abortController = new AbortController();

    setIsPlansLoading(true);
    setPlansErrorMessage(null);

    void fetchPlans(abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setPlans(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setPlansErrorMessage(
          getErrorMessage(
            error,
            "We could not load active plans for membership assignment."
          )
        );
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsPlansLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [plansReloadKey]);

  useEffect(() => {
    if (plans.length === 0) {
      return;
    }

    setAssignValues((currentValues) => {
      const selectedPlanStillExists = plans.some(
        (plan) => plan.id === currentValues.planId
      );

      if (selectedPlanStillExists) {
        return currentValues;
      }

      return {
        ...currentValues,
        planId: plans[0].id
      };
    });
  }, [plans]);

  useEffect(() => {
    const activeMembership = member?.activeMembership;

    if (!activeMembership) {
      return;
    }

    const todayDateValue = getTodayDateValue();

    setCancelValues({
      effectiveDate:
        activeMembership.startDate > todayDateValue
          ? activeMembership.startDate
          : todayDateValue
    });
  }, [member?.activeMembership?.id, member?.activeMembership?.startDate]);

  const handleAssignFieldChange = (
    field: keyof AssignMembershipFormValues,
    value: string
  ) => {
    setAssignValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));

    setAssignErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setAssignFormError(null);
  };

  const handleAssignMembership = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id || !member) {
      return;
    }

    const todayDateValue = getTodayDateValue();
    const nextErrors = validateAssignMembershipForm(
      assignValues,
      todayDateValue
    );

    if (Object.keys(nextErrors).length > 0) {
      setAssignErrors(nextErrors);
      return;
    }

    setIsAssignSubmitting(true);
    setAssignFormError(null);
    setActionNotice(null);

    try {
      const membership = await assignMembershipToMember(id, {
        planId: assignValues.planId,
        startDate: assignValues.startDate
      });

      setActionNotice({
        title: "Membership assigned.",
        description: `${membership.plan.name} starts on ${formatDate(
          membership.startDate
        )}.`
      });
      setReloadKey((currentValue) => currentValue + 1);
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "INVALID_START_DATE"
      ) {
        setAssignErrors((currentErrors) => ({
          ...currentErrors,
          startDate: error.message
        }));
      } else {
        setAssignFormError(
          getErrorMessage(
            error,
            "We could not assign the membership. Please try again."
          )
        );
      }
    } finally {
      setIsAssignSubmitting(false);
    }
  };

  const handleCancelMembership = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id || !member?.activeMembership) {
      return;
    }

    const todayDateValue = getTodayDateValue();
    const nextErrors = validateCancelMembershipForm(
      cancelValues,
      member.activeMembership.startDate,
      todayDateValue
    );

    if (Object.keys(nextErrors).length > 0) {
      setCancelErrors(nextErrors);
      return;
    }

    setIsCancelSubmitting(true);
    setCancelFormError(null);
    setActionNotice(null);

    try {
      const membership = await cancelMembershipForMember(
        id,
        member.activeMembership.id,
        {
          effectiveDate: cancelValues.effectiveDate
        }
      );

      setActionNotice({
        title: "Membership canceled.",
        description: `${membership.plan.name} was canceled effective ${formatDate(
          membership.cancellationEffectiveDate ?? cancelValues.effectiveDate
        )}.`
      });
      setReloadKey((currentValue) => currentValue + 1);
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "INVALID_CANCELLATION_EFFECTIVE_DATE"
      ) {
        setCancelErrors((currentErrors) => ({
          ...currentErrors,
          effectiveDate: error.message
        }));
      } else {
        setCancelFormError(
          getErrorMessage(
            error,
            "We could not cancel the membership. Please try again."
          )
        );
      }
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  const handleRecordCheckIn = async () => {
    if (!id || !member) {
      return;
    }

    setIsCheckInSubmitting(true);
    setCheckInError(null);
    setActionNotice(null);

    try {
      const checkIn = await recordMemberCheckIn(id);

      setActionNotice({
        title: "Check-in recorded.",
        description: `${formatMemberName(member)} checked in at ${formatDateTime(
          checkIn.checkedInAt
        )}.`
      });
      setReloadKey((currentValue) => currentValue + 1);
    } catch (error) {
      setCheckInError(
        getErrorMessage(
          error,
          "We could not record the check-in. Please try again."
        )
      );
    } finally {
      setIsCheckInSubmitting(false);
    }
  };

  const todayDateValue = getTodayDateValue();
  const isInitialLoad = isLoading && (!member || member.id !== id);

  if (isInitialLoad) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Member Summary"
          title="Member details"
          description="Loading the latest membership and activity snapshot."
          actions={
            <Link className="button button--secondary" to="/members">
              Back to members
            </Link>
          }
        />
        <Card>
          <LoadingState label="Loading member summary..." />
        </Card>
      </div>
    );
  }

  if ((errorMessage && !member) || !member) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Member Summary"
          title="Member details"
          description="Review member details, recent activity, and future action areas."
          actions={
            <Link className="button button--secondary" to="/members">
              Back to members
            </Link>
          }
        />
        <Card>
          <ErrorState
            title="Member summary unavailable"
            description={
              errorMessage ??
              "The member could not be found or the request did not complete."
            }
            action={
              <Button
                onClick={() => setReloadKey((currentValue) => currentValue + 1)}
                variant="secondary"
              >
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const activeMembership = member.activeMembership;
  const hasActiveMembership = Boolean(activeMembership);
  const isRefreshing = isLoading && member.id === id;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Member Summary"
        title={formatMemberName(member)}
        description="Manage memberships, record attendance, and review the latest member activity from one place."
        actions={
          <>
            <Link className="button button--secondary" to="/members">
              Back to members
            </Link>
            <Link className="button button--ghost" to="/members/new">
              New member
            </Link>
          </>
        }
      />

      {locationState?.successMessage ? (
        <Notice
          description="The member record is ready for follow-up actions."
          title={locationState.successMessage}
          tone="success"
        />
      ) : null}

      {actionNotice ? (
        <Notice
          description={actionNotice.description}
          title={actionNotice.title}
          tone="success"
        />
      ) : null}

      {errorMessage ? <FormError message={errorMessage} /> : null}

      <div className="summary-grid">
        <div className="summary-grid__full">
          <Section
            title="Quick actions"
            description="Assign plans, cancel memberships, and record check-ins without leaving this view."
          >
            <Card>
              <div className="action-grid">
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
                        <Button
                          onClick={() =>
                            setPlansReloadKey((currentValue) => currentValue + 1)
                          }
                          variant="secondary"
                        >
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
                    <form
                      className="action-form"
                      noValidate
                      onSubmit={handleAssignMembership}
                    >
                      <Field
                        error={assignErrors.planId}
                        htmlFor="assign-plan-id"
                        label="Plan"
                      >
                        <Select
                          disabled={
                            hasActiveMembership ||
                            isAssignSubmitting ||
                            isRefreshing
                          }
                          hasError={Boolean(assignErrors.planId)}
                          id="assign-plan-id"
                          onChange={(event) =>
                            handleAssignFieldChange("planId", event.target.value)
                          }
                          value={assignValues.planId}
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
                        error={assignErrors.startDate}
                        htmlFor="assign-start-date"
                        label="Start date"
                      >
                        <Input
                          disabled={
                            hasActiveMembership ||
                            isAssignSubmitting ||
                            isRefreshing
                          }
                          hasError={Boolean(assignErrors.startDate)}
                          id="assign-start-date"
                          max={todayDateValue}
                          onChange={(event) =>
                            handleAssignFieldChange(
                              "startDate",
                              event.target.value
                            )
                          }
                          type="date"
                          value={assignValues.startDate}
                        />
                      </Field>

                      <p className="action-form__note">
                        {hasActiveMembership && activeMembership
                          ? `This member already has ${activeMembership.plan.name} active. Cancel it before assigning a new plan.`
                          : "A member can have at most one active membership at a time."}
                      </p>

                      <FormError message={assignFormError} />

                      <div className="action-form__actions">
                        <Button
                          disabled={
                            hasActiveMembership ||
                            isAssignSubmitting ||
                            isRefreshing
                          }
                          type="submit"
                        >
                          {isAssignSubmitting
                            ? "Assigning..."
                            : "Assign membership"}
                        </Button>
                      </div>
                    </form>
                  )}
                </article>

                <article className="action-panel">
                  <div className="action-panel__header">
                    <div>
                      <h3 className="action-panel__title">
                        Cancel membership
                      </h3>
                      <p className="action-panel__description">
                        Record the effective cancellation date for the active
                        membership.
                      </p>
                    </div>
                    <StatusPill
                      label={hasActiveMembership ? "Ready" : "Unavailable"}
                      tone={hasActiveMembership ? "warning" : "neutral"}
                    />
                  </div>

                  <form
                    className="action-form"
                    noValidate
                    onSubmit={handleCancelMembership}
                  >
                    <div className="action-panel__details">
                      <p className="action-panel__meta">
                        Active plan:{" "}
                        <strong>
                          {activeMembership
                            ? activeMembership.plan.name
                            : "No active membership"}
                        </strong>
                      </p>
                      <p className="action-panel__meta">
                        Current status:{" "}
                        <strong>
                          {activeMembership ? activeMembership.status : "N/A"}
                        </strong>
                      </p>
                    </div>

                    <Field
                      error={cancelErrors.effectiveDate}
                      htmlFor="cancel-effective-date"
                      label="Effective date"
                    >
                      <Input
                        disabled={
                          !hasActiveMembership ||
                          isCancelSubmitting ||
                          isRefreshing
                        }
                        hasError={Boolean(cancelErrors.effectiveDate)}
                        id="cancel-effective-date"
                        max={todayDateValue}
                        min={activeMembership?.startDate}
                        onChange={(event) => {
                          setCancelValues({
                            effectiveDate: event.target.value
                          });
                          setCancelErrors((currentErrors) => ({
                            ...currentErrors,
                            effectiveDate: undefined
                          }));
                          setCancelFormError(null);
                        }}
                        type="date"
                        value={cancelValues.effectiveDate}
                      />
                    </Field>

                    <p className="action-form__note">
                      {activeMembership
                        ? `The effective date must be on or after ${formatDate(
                            activeMembership.startDate
                          )}.`
                        : "This member has no active membership to cancel."}
                    </p>

                    <FormError message={cancelFormError} />

                    <div className="action-form__actions">
                      <Button
                        disabled={
                          !hasActiveMembership ||
                          isCancelSubmitting ||
                          isRefreshing
                        }
                        type="submit"
                        variant="secondary"
                      >
                        {isCancelSubmitting
                          ? "Canceling..."
                          : "Cancel membership"}
                      </Button>
                    </div>
                  </form>
                </article>

                <article className="action-panel">
                  <div className="action-panel__header">
                    <div>
                      <h3 className="action-panel__title">Record check-in</h3>
                      <p className="action-panel__description">
                        Attendance is allowed only while the member has an
                        active membership.
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
                        {activeMembership
                          ? activeMembership.plan.name
                          : "No active membership"}
                      </strong>
                    </p>
                    <p className="action-panel__meta">
                      Last check-in:{" "}
                      <strong>
                        {member.lastCheckInAt
                          ? formatDateTime(member.lastCheckInAt)
                          : "No check-ins"}
                      </strong>
                    </p>
                    <p className="action-panel__meta">
                      Last 30 days:{" "}
                      <strong>{member.checkInCountLast30Days} check-ins</strong>
                    </p>
                  </div>

                  <p className="action-form__note">
                    {hasActiveMembership
                      ? "Use this to register the member's next visit."
                      : "Activate a membership before recording a check-in."}
                  </p>

                  <FormError message={checkInError} />

                  <div className="action-form__actions">
                    <Button
                      disabled={
                        !hasActiveMembership ||
                        isCheckInSubmitting ||
                        isRefreshing
                      }
                      onClick={handleRecordCheckIn}
                    >
                      {isCheckInSubmitting
                        ? "Recording..."
                        : "Record check-in"}
                    </Button>
                  </div>
                </article>
              </div>
            </Card>
          </Section>
        </div>

        <div className="summary-grid__full">
          <Section
            title="Member details"
            description="Basic member information synced from the backend summary endpoint."
          >
            <Card>
              <div className="detail-list">
                <div className="detail-list__row">
                  <span className="detail-list__label">Email</span>
                  <p className="detail-list__value">{member.email}</p>
                </div>
                <div className="detail-list__row">
                  <span className="detail-list__label">Age</span>
                  <p className="detail-list__value detail-list__value--muted">
                    {member.age ?? "Not provided"}
                  </p>
                </div>
                <div className="detail-list__row">
                  <span className="detail-list__label">Phone number</span>
                  <p className="detail-list__value detail-list__value--muted">
                    {member.phoneNumber ?? "Not provided"}
                  </p>
                </div>
                <div className="detail-list__row">
                  <span className="detail-list__label">Address</span>
                  <p className="detail-list__value detail-list__value--muted">
                    {member.address ?? "Not provided"}
                  </p>
                </div>
                <div className="detail-list__row">
                  <span className="detail-list__label">Created at</span>
                  <p className="detail-list__value detail-list__value--muted">
                    {formatDateTime(member.createdAt)}
                  </p>
                </div>
                <div className="detail-list__row">
                  <span className="detail-list__label">Last updated</span>
                  <p className="detail-list__value detail-list__value--muted">
                    {formatDateTime(member.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </Section>
        </div>

        <Section
          title="Membership"
          description="Current active membership status and plan details."
        >
          <Card>
            <div className="stack">
              <div>
                <StatusPill
                  label={activeMembership ? activeMembership.status : "No active membership"}
                  tone={activeMembership ? "positive" : "neutral"}
                />
              </div>

              {activeMembership ? (
                <div className="detail-list">
                  <div className="detail-list__row">
                    <span className="detail-list__label">Plan</span>
                    <p className="detail-list__value">
                      {activeMembership.plan.name}
                    </p>
                  </div>
                  <div className="detail-list__row">
                    <span className="detail-list__label">Billing</span>
                    <p className="detail-list__value detail-list__value--muted">
                      {formatBillingPeriod(activeMembership.plan.billingPeriod)} |{" "}
                      {formatCurrencyFromCents(activeMembership.plan.priceCents)}
                    </p>
                  </div>
                  <div className="detail-list__row">
                    <span className="detail-list__label">Start date</span>
                    <p className="detail-list__value detail-list__value--muted">
                      {formatDate(activeMembership.startDate)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="quick-actions__note">
                  This member does not have an active membership yet.
                </p>
              )}
            </div>
          </Card>
        </Section>

        <Section
          title="Activity"
          description="Latest attendance indicators from the member summary."
        >
          <Card>
            <div className="metric-grid">
              <div className="metric-card">
                <p className="metric-card__label">Last check-in</p>
                <p className="metric-card__value">
                  {member.lastCheckInAt
                    ? formatDateTime(member.lastCheckInAt)
                    : "No check-ins"}
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-card__label">Last 30 days</p>
                <p className="metric-card__value">
                  {member.checkInCountLast30Days} check-ins
                </p>
              </div>
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}

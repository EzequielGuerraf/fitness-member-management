import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { fetchMemberSummary } from "../api/members";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { StatusPill } from "../components/ui/StatusPill";
import type { MemberSummary } from "../types/members";
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

export function MemberSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state as MemberSummaryLocationState | null;
  const [member, setMember] = useState<MemberSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setErrorMessage("The requested member id is missing.");
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

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

  if (isLoading) {
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

  if (errorMessage || !member) {
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

  return (
    <div className="page">
      <PageHeader
        eyebrow="Member Summary"
        title={formatMemberName(member)}
        description="This view is ready for the next step, where membership actions and check-ins will be enabled."
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

      <div className="summary-grid">
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
          description="Current membership status and plan details."
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
          description="Recent attendance signals already exposed by the backend summary."
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

        <div className="summary-grid__full">
          <Section
            title="Quick actions"
            description="Reserved for the next step so the page already demos the intended workflow."
          >
            <Card>
              <div className="quick-actions">
                <Button disabled variant="secondary">
                  Assign membership
                </Button>
                <Button disabled variant="secondary">
                  Cancel membership
                </Button>
                <Button disabled variant="secondary">
                  Record check-in
                </Button>
              </div>
              <p className="quick-actions__note">
                These actions are intentionally disabled in this frontend step.
              </p>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

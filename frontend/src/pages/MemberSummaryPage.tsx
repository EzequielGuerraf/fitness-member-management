import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { FormError } from "../components/ui/FormError";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { AssignMembershipPanel } from "../components/members/AssignMembershipPanel";
import { CancelMembershipPanel } from "../components/members/CancelMembershipPanel";
import { RecordCheckInPanel } from "../components/members/RecordCheckInPanel";
import { MemberDetailsSection } from "../components/members/MemberDetailsSection";
import { MembershipSection } from "../components/members/MembershipSection";
import { ActivitySection } from "../components/members/ActivitySection";
import { useMemberSummary } from "../hooks/useMemberSummary";
import { useAssignMembership } from "../hooks/useAssignMembership";
import { useCancelMembership } from "../hooks/useCancelMembership";
import { useRecordCheckIn } from "../hooks/useRecordCheckIn";
import { formatMemberName } from "../utils/format";

interface MemberSummaryLocationState {
  successMessage?: string;
}

interface ActionNoticeState {
  description: string;
  title: string;
}

export function MemberSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state as MemberSummaryLocationState | null;
  const [actionNotice, setActionNotice] = useState<ActionNoticeState | null>(
    null
  );

  const {
    member,
    plans,
    errorMessage,
    plansErrorMessage,
    isLoading,
    isPlansLoading,
    reloadMember,
    reloadPlans,
  } = useMemberSummary(id);

  const todayDateValue = new Date().toISOString().slice(0, 10);

  const handleActionNotice = (title: string, description: string) => {
    setActionNotice({ title, description });
  };

  const hasActiveMembership = Boolean(member?.activeMembership);
  const isRefreshing = isLoading && member?.id === id;

  const assignMembership = useAssignMembership(
    id,
    plans,
    hasActiveMembership,
    handleActionNotice,
    reloadMember
  );

  const cancelMembership = useCancelMembership(
    id,
    member,
    handleActionNotice,
    reloadMember
  );

  const recordCheckIn = useRecordCheckIn(
    id,
    member,
    handleActionNotice,
    reloadMember
  );

  const isInitialLoad = isLoading && (!member || member?.id !== id);

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
                onClick={() => reloadMember()}
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
                <AssignMembershipPanel
                  plans={plans}
                  plansErrorMessage={plansErrorMessage}
                  isPlansLoading={isPlansLoading}
                  hasActiveMembership={hasActiveMembership}
                  activeMembershipPlanName={activeMembership?.plan.name}
                  isRefreshing={isRefreshing}
                  values={assignMembership.values}
                  errors={assignMembership.errors}
                  formError={assignMembership.formError}
                  isSubmitting={assignMembership.isSubmitting}
                  onFieldChange={assignMembership.handleFieldChange}
                  onSubmit={assignMembership.handleSubmit}
                  onRetryPlans={reloadPlans}
                  todayDateValue={todayDateValue}
                />

                <CancelMembershipPanel
                  hasActiveMembership={hasActiveMembership}
                  activeMembershipPlanName={activeMembership?.plan.name}
                  activeMembershipStatus={activeMembership?.status}
                  activeMembershipStartDate={activeMembership?.startDate}
                  isRefreshing={isRefreshing}
                  values={cancelMembership.values}
                  errors={cancelMembership.errors}
                  formError={cancelMembership.formError}
                  isSubmitting={cancelMembership.isSubmitting}
                  onFieldChange={cancelMembership.handleFieldChange}
                  onSubmit={cancelMembership.handleSubmit}
                  todayDateValue={todayDateValue}
                />

                <RecordCheckInPanel
                  hasActiveMembership={hasActiveMembership}
                  activeMembershipPlanName={activeMembership?.plan.name}
                  lastCheckInAt={member.lastCheckInAt}
                  checkInCountLast30Days={member.checkInCountLast30Days}
                  isRefreshing={isRefreshing}
                  error={recordCheckIn.error}
                  isSubmitting={recordCheckIn.isSubmitting}
                  onRecord={recordCheckIn.handleRecord}
                />
              </div>
            </Card>
          </Section>
        </div>

        <MemberDetailsSection member={member} />

        <MembershipSection activeMembership={activeMembership} />

        <ActivitySection
          lastCheckInAt={member.lastCheckInAt}
          checkInCountLast30Days={member.checkInCountLast30Days}
        />
      </div>
    </div>
  );
}

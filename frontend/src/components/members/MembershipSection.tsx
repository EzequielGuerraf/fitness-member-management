import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { StatusPill } from "../ui/StatusPill";
import type { MemberSummary } from "../../types/members";
import { formatBillingPeriod, formatCurrencyFromCents, formatDate } from "../../utils/format";

interface MembershipSectionProps {
  activeMembership: MemberSummary["activeMembership"];
}

export function MembershipSection({ activeMembership }: MembershipSectionProps) {
  return (
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
  );
}
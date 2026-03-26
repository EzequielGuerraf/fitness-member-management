import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import type { MemberSummary } from "../../types/members";
import { formatDateTime } from "../../utils/format";

interface MemberDetailsSectionProps {
  member: MemberSummary;
}

export function MemberDetailsSection({ member }: MemberDetailsSectionProps) {
  return (
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
  );
}
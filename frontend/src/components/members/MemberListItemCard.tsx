import { Link } from "react-router-dom";
import type { MemberListItem } from "../../types/members";
import { formatDateTime, formatMemberName } from "../../utils/format";

interface MemberListItemCardProps {
  member: MemberListItem;
}

export function MemberListItemCard({ member }: MemberListItemCardProps) {
  return (
    <Link className="member-list-item" to={`/members/${member.id}`}>
      <div className="member-list-item__header">
        <div>
          <h3 className="member-list-item__title">{formatMemberName(member)}</h3>
          <p className="member-list-item__subtitle">{member.email}</p>
        </div>

        <span aria-hidden="true" className="member-list-item__arrow">
          View
        </span>
      </div>

      <p className="member-list-item__meta">
        Created {formatDateTime(member.createdAt)}
      </p>
    </Link>
  );
}

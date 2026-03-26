import { MemberListItemCard } from "./MemberListItemCard";
import type { MemberListItem } from "../../types/members";

interface MemberListProps {
  members: MemberListItem[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="member-list">
      {members.map((member) => (
        <MemberListItemCard key={member.id} member={member} />
      ))}
    </div>
  );
}

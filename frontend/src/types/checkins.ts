export interface CheckInListItem {
  checkedInAt: string;
  createdAt: string;
  id: string;
  member: {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
  };
  memberId: string;
}

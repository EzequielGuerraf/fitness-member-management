import type { MemberListItem } from "../types/members";
import type { BillingPeriod } from "../types/plans";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

export const formatDate = (value: string): string => {
  return dateFormatter.format(new Date(value));
};

export const formatDateTime = (value: string): string => {
  return dateTimeFormatter.format(new Date(value));
};

export const formatMemberName = (
  member: Pick<MemberListItem, "firstName" | "lastName">
): string => {
  return `${member.firstName} ${member.lastName}`.trim();
};

export const formatBillingPeriod = (
  value: BillingPeriod
): string => {
  return value.charAt(0) + value.slice(1).toLowerCase();
};

export const formatCurrencyFromCents = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value / 100);
};

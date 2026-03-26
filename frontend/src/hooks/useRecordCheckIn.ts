import { useState } from "react";
import { getErrorMessage } from "../api/client";
import { recordMemberCheckIn } from "../api/members";
import type { MemberSummary } from "../types/members";
import { formatDateTime, formatMemberName } from "../utils/format";

export function useRecordCheckIn(
  memberId: string | undefined,
  member: MemberSummary | null,
  onSuccess: (title: string, description: string) => void,
  reloadMember: () => void
) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecord = async () => {
    if (!memberId || !member) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const checkIn = await recordMemberCheckIn(memberId);

      onSuccess(
        "Check-in recorded.",
        `${formatMemberName(member)} checked in at ${formatDateTime(
          checkIn.checkedInAt
        )}.`
      );
      reloadMember();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "We could not record the check-in. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    error,
    isSubmitting,
    handleRecord,
  };
}
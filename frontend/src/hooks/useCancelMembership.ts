import { useEffect, useState } from "react";
import { ApiClientError, getErrorMessage } from "../api/client";
import { cancelMembershipForMember } from "../api/members";
import type { MemberSummary } from "../types/members";
import { formatDate } from "../utils/format";

interface CancelMembershipFormValues {
  effectiveDate: string;
}

interface CancelMembershipFormErrors {
  effectiveDate?: string;
}

const getTodayDateValue = (): string => {
  return new Date().toISOString().slice(0, 10);
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

export function useCancelMembership(
  memberId: string | undefined,
  member: MemberSummary | null,
  onSuccess: (title: string, description: string) => void,
  reloadMember: () => void
) {
  const [values, setValues] = useState<CancelMembershipFormValues>({
    effectiveDate: getTodayDateValue()
  });
  const [errors, setErrors] = useState<CancelMembershipFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const activeMembership = member?.activeMembership;

    if (!activeMembership) {
      return;
    }

    const todayDateValue = getTodayDateValue();

    setValues({
      effectiveDate:
        activeMembership.startDate > todayDateValue
          ? activeMembership.startDate
          : todayDateValue
    });
  }, [member?.activeMembership?.id, member?.activeMembership?.startDate]);

  const handleFieldChange = (value: string) => {
    setValues({ effectiveDate: value });
    setErrors((currentErrors) => ({
      ...currentErrors,
      effectiveDate: undefined
    }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!memberId || !member?.activeMembership) {
      return;
    }

    const todayDateValue = getTodayDateValue();
    const nextErrors = validateCancelMembershipForm(
      values,
      member.activeMembership.startDate,
      todayDateValue
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const membership = await cancelMembershipForMember(
        memberId,
        member.activeMembership.id,
        {
          effectiveDate: values.effectiveDate
        }
      );

      onSuccess(
        "Membership canceled.",
        `${membership.plan.name} was canceled effective ${formatDate(
          membership.cancellationEffectiveDate ?? values.effectiveDate
        )}.`
      );
      reloadMember();
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "INVALID_CANCELLATION_EFFECTIVE_DATE"
      ) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          effectiveDate: error.message
        }));
      } else {
        setFormError(
          getErrorMessage(
            error,
            "We could not cancel the membership. Please try again."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    formError,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
  };
}
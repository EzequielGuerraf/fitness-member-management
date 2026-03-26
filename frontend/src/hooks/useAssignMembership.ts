import { useEffect, useState } from "react";
import { ApiClientError, getErrorMessage } from "../api/client";
import { assignMembershipToMember } from "../api/members";
import type { MembershipPlan } from "../types/plans";
import { formatDate } from "../utils/format";

interface AssignMembershipFormValues {
  planId: string;
  startDate: string;
}

interface AssignMembershipFormErrors {
  planId?: string;
  startDate?: string;
}

const getTodayDateValue = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const validateAssignMembershipForm = (
  values: AssignMembershipFormValues,
  todayDateValue: string
): AssignMembershipFormErrors => {
  const errors: AssignMembershipFormErrors = {};

  if (!values.planId) {
    errors.planId = "Select an active plan.";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required.";
  } else if (values.startDate > todayDateValue) {
    errors.startDate = "Start date cannot be in the future.";
  }

  return errors;
};

export function useAssignMembership(
  memberId: string | undefined,
  plans: MembershipPlan[],
  hasActiveMembership: boolean,
  onSuccess: (title: string, description: string) => void,
  reloadMember: () => void
) {
  const [values, setValues] = useState<AssignMembershipFormValues>({
    planId: "",
    startDate: getTodayDateValue()
  });
  const [errors, setErrors] = useState<AssignMembershipFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plans.length === 0) {
      return;
    }

    setValues((currentValues) => {
      const selectedPlanStillExists = plans.some(
        (plan) => plan.id === currentValues.planId
      );

      if (selectedPlanStillExists) {
        return currentValues;
      }

      return {
        ...currentValues,
        planId: plans[0].id
      };
    });
  }, [plans]);

  const handleFieldChange = (
    field: keyof AssignMembershipFormValues,
    value: string
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!memberId || hasActiveMembership) {
      return;
    }

    const todayDateValue = getTodayDateValue();
    const nextErrors = validateAssignMembershipForm(values, todayDateValue);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const membership = await assignMembershipToMember(memberId, {
        planId: values.planId,
        startDate: values.startDate
      });

      onSuccess(
        "Membership assigned.",
        `${membership.plan.name} starts on ${formatDate(membership.startDate)}.`
      );
      reloadMember();
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "INVALID_START_DATE"
      ) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          startDate: error.message
        }));
      } else {
        setFormError(
          getErrorMessage(
            error,
            "We could not assign the membership. Please try again."
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
import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { fetchMemberSummary } from "../api/members";
import { fetchPlans } from "../api/plans";
import type { MemberSummary } from "../types/members";
import type { MembershipPlan } from "../types/plans";

export function useMemberSummary(memberId: string | undefined) {
  const [member, setMember] = useState<MemberSummary | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plansErrorMessage, setPlansErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [plansReloadKey, setPlansReloadKey] = useState(0);

  useEffect(() => {
    if (!memberId) {
      setMember(null);
      setErrorMessage("The requested member id is missing.");
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    setMember((currentMember) =>
      currentMember?.id === memberId ? currentMember : null
    );
    setIsLoading(true);
    setErrorMessage(null);

    void fetchMemberSummary(memberId, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setMember(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          getErrorMessage(
            error,
            "We could not load the member summary. Please try again."
          )
        );
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [memberId, reloadKey]);

  useEffect(() => {
    const abortController = new AbortController();

    setIsPlansLoading(true);
    setPlansErrorMessage(null);

    void fetchPlans(abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setPlans(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setPlansErrorMessage(
          getErrorMessage(
            error,
            "We could not load active plans for membership assignment."
          )
        );
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsPlansLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [plansReloadKey]);

  const reloadMember = () => setReloadKey((currentValue) => currentValue + 1);
  const reloadPlans = () => setPlansReloadKey((currentValue) => currentValue + 1);

  return {
    member,
    plans,
    errorMessage,
    plansErrorMessage,
    isLoading,
    isPlansLoading,
    reloadMember,
    reloadPlans,
  };
}
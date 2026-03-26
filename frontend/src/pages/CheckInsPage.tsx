import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { fetchCheckIns } from "../api/checkins";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import type { CheckInListItem } from "../types/checkins";
import { formatDateTime, formatMemberName } from "../utils/format";

export function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckInListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    void fetchCheckIns(abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setCheckIns(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          getErrorMessage(
            error,
            "We could not load the check-in log. Please try again."
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
  }, [reloadKey]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Check-ins"
        title="Check-in log"
        description="Review all recorded member visits in reverse chronological order."
        actions={
          <>
            <Link className="button button--secondary" to="/members">
              Back to members
            </Link>
            <Button
              onClick={() => setReloadKey((currentValue) => currentValue + 1)}
              variant="ghost"
            >
              Refresh
            </Button>
          </>
        }
      />

      <Card>
        <div className="members-toolbar">
          <div className="members-toolbar__row">
            <span className="members-toolbar__meta">
              {isLoading
                ? "Loading check-ins..."
                : `${checkIns.length} check-in${checkIns.length === 1 ? "" : "s"} shown`}
            </span>
          </div>

          {isLoading ? (
            <LoadingState label="Loading check-ins..." />
          ) : errorMessage ? (
            <ErrorState
              title="Check-in log unavailable"
              description={errorMessage}
              action={
                <Button
                  onClick={() => setReloadKey((currentValue) => currentValue + 1)}
                  variant="secondary"
                >
                  Retry
                </Button>
              }
            />
          ) : checkIns.length === 0 ? (
            <EmptyState
              title="No check-ins yet"
              description="Record the first member visit from a member detail page."
              action={
                <Link className="button button--secondary" to="/members">
                  View members
                </Link>
              }
            />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Member</th>
                    <th scope="col">Email</th>
                    <th scope="col">Checked in at</th>
                    <th scope="col">Recorded at</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.map((checkIn) => (
                    <tr key={checkIn.id}>
                      <td className="data-table__cell data-table__cell--strong">
                        {formatMemberName(checkIn.member)}
                      </td>
                      <td className="data-table__cell data-table__cell--muted">
                        {checkIn.member.email}
                      </td>
                      <td className="data-table__cell">
                        {formatDateTime(checkIn.checkedInAt)}
                      </td>
                      <td className="data-table__cell data-table__cell--muted">
                        {formatDateTime(checkIn.createdAt)}
                      </td>
                      <td className="data-table__cell data-table__cell--actions">
                        <Link
                          className="inline-link"
                          to={`/members/${checkIn.memberId}`}
                        >
                          View member
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

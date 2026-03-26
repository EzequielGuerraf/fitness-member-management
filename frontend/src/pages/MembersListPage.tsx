import { startTransition, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { fetchMembers } from "../api/members";
import { MemberList } from "../components/members/MemberList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import type { MemberListItem } from "../types/members";

export function MembersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(currentQuery);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSearchInput(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      const trimmedSearch = searchInput.trim();

      if (trimmedSearch === currentQuery) {
        return;
      }

      startTransition(() => {
        if (trimmedSearch) {
          setSearchParams({ q: trimmedSearch }, { replace: true });
        } else {
          setSearchParams({}, { replace: true });
        }
      });
    }, 250);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [currentQuery, searchInput, setSearchParams]);

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    void fetchMembers(currentQuery, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setMembers(response);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          getErrorMessage(
            error,
            "We could not load members. Please try again."
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
  }, [currentQuery, reloadKey]);

  const hasSearch = currentQuery.trim().length > 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Members"
        title="Members directory"
        description="View and manage all your members in one place. Use the search to quickly find specific members by name or email."
        actions={
          <Link className="button button--primary" to="/members/new">
            Create member
          </Link>
        }
      />

      <Card>
        <div className="members-toolbar">
          <div className="members-toolbar__row">
            <Field htmlFor="members-search" label="Search members">
              <div className="search-input-group">
                <Input
                  className="search-input-group__field"
                  id="members-search"
                  name="q"
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name or email"
                  value={searchInput}
                />

                {searchInput ? (
                  <Button onClick={() => setSearchInput("")} variant="secondary">
                    Clear
                  </Button>
                ) : null}
              </div>
            </Field>
          </div>

          <div className="members-toolbar__row">
            <span className="members-toolbar__meta">
              {isLoading
                ? "Loading members..."
                : `${members.length} member${members.length === 1 ? "" : "s"} shown`}
            </span>
            {hasSearch ? (
              <span className="members-toolbar__meta">
                Filtering by “{currentQuery}”
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <LoadingState label="Loading members..." />
          ) : errorMessage ? (
            <ErrorState
              title="Members list unavailable"
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
          ) : members.length === 0 ? (
            <EmptyState
              title={hasSearch ? "No members matched this search" : "No members yet"}
              description={
                hasSearch
                  ? "Try another name or email fragment."
                  : "Create the first member to start using the directory."
              }
              action={
                <Link className="button button--secondary" to="/members/new">
                  Create member
                </Link>
              }
            />
          ) : (
            <MemberList members={members} />
          )}
        </div>
      </Card>
    </div>
  );
}

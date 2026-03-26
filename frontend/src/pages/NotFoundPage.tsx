import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";

export function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Not Found"
        title="This page does not exist"
        description="Use the member directory to continue navigating the app."
      />

      <Card>
        <EmptyState
          title="Route not found"
          description="The page you requested is not available in this frontend step."
          action={
            <Link className="button button--secondary" to="/members">
              Go to members
            </Link>
          }
        />
      </Card>
    </div>
  );
}

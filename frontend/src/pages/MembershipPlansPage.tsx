import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClientError, getErrorMessage } from "../api/client";
import { createPlan, fetchPlans } from "../api/plans";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Field } from "../components/ui/Field";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { Select } from "../components/ui/Select";
import { StatusPill } from "../components/ui/StatusPill";
import { TextArea } from "../components/ui/TextArea";
import type {
  BillingPeriod,
  CreatePlanInput,
  MembershipPlan
} from "../types/plans";
import {
  formatBillingPeriod,
  formatCurrencyFromCents,
  formatDateTime
} from "../utils/format";

interface CreatePlanFormValues {
  billingPeriod: BillingPeriod;
  description: string;
  name: string;
  price: string;
}

interface CreatePlanFormErrors {
  billingPeriod?: string;
  description?: string;
  name?: string;
  price?: string;
}

const BILLING_PERIOD_OPTIONS: BillingPeriod[] = [
  "MONTHLY",
  "QUARTERLY",
  "YEARLY"
];

const validatePlanForm = (
  values: CreatePlanFormValues
): CreatePlanFormErrors => {
  const errors: CreatePlanFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Plan name is required.";
  } else if (values.name.trim().length > 100) {
    errors.name = "Plan name must be at most 100 characters.";
  }

  if (values.description.trim().length > 500) {
    errors.description = "Description must be at most 500 characters.";
  }

  if (!values.price.trim()) {
    errors.price = "Price is required.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.price.trim())) {
    errors.price = "Enter a valid amount with up to 2 decimals.";
  }

  return errors;
};

const mapPriceToCents = (value: string): number => {
  return Math.round(Number(value) * 100);
};

export function MembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [errors, setErrors] = useState<CreatePlanFormErrors>({});
  const [values, setValues] = useState<CreatePlanFormValues>({
    name: "",
    description: "",
    price: "",
    billingPeriod: "MONTHLY"
  });

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setLoadError(null);

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

        setLoadError(
          getErrorMessage(error, "We could not load membership plans.")
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

  const handleFieldChange = (
    field: keyof CreatePlanFormValues,
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
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validatePlanForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CreatePlanInput = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      priceCents: mapPriceToCents(values.price.trim()),
      billingPeriod: values.billingPeriod
    };

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const createdPlan = await createPlan(payload);

      setPlans((currentPlans) =>
        [...currentPlans, createdPlan].sort((left, right) => {
          if (left.priceCents !== right.priceCents) {
            return left.priceCents - right.priceCents;
          }

          return left.name.localeCompare(right.name);
        })
      );
      setValues({
        name: "",
        description: "",
        price: "",
        billingPeriod: "MONTHLY"
      });
      setSuccessMessage(`Plan "${createdPlan.name}" was created successfully.`);
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "PLAN_NAME_ALREADY_EXISTS"
      ) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          name: error.message
        }));
      } else {
        setSubmitError(
          getErrorMessage(error, "We could not create the membership plan.")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Plans"
        title="Membership plans"
        description="Create and manage membership plans to structure your offerings and streamline member sign-ups."
        actions={
          <Link className="button button--secondary" to="/members">
            Back to members
          </Link>
        }
      />

      <div className="summary-grid">
        <Section
          title="Create plan"
          description="Set up a new membership plan by providing the details and pricing."
        >
          <Card className="plan-form-card">
            <form className="form plan-form" noValidate onSubmit={handleSubmit}>
              <Field error={errors.name} htmlFor="plan-name" label="Plan name">
                <Input
                  hasError={Boolean(errors.name)}
                  id="plan-name"
                  maxLength={100}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Standard Monthly"
                  value={values.name}
                />
              </Field>

              <div className="form__grid">
                <Field error={errors.price} htmlFor="plan-price" label="Price">
                  <Input
                    hasError={Boolean(errors.price)}
                    id="plan-price"
                    inputMode="decimal"
                    onChange={(event) => handleFieldChange("price", event.target.value)}
                    placeholder="49.99"
                    value={values.price}
                  />
                </Field>

                <Field
                  error={errors.billingPeriod}
                  htmlFor="plan-billing-period"
                  label="Billing period"
                >
                  <Select
                    hasError={Boolean(errors.billingPeriod)}
                    id="plan-billing-period"
                    onChange={(event) =>
                      handleFieldChange(
                        "billingPeriod",
                        event.target.value as BillingPeriod
                      )
                    }
                    value={values.billingPeriod}
                  >
                    {BILLING_PERIOD_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatBillingPeriod(option)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                error={errors.description}
                htmlFor="plan-description"
                label="Description"
              >
                <TextArea
                  hasError={Boolean(errors.description)}
                  id="plan-description"
                  maxLength={500}
                  onChange={(event) =>
                    handleFieldChange("description", event.target.value)
                  }
                  placeholder="Recurring monthly access with standard gym benefits."
                  rows={4}
                  value={values.description}
                />
              </Field>

              {successMessage ? (
                <Notice
                  description="The new plan is now available in the active plans list."
                  title={successMessage}
                  tone="success"
                />
              ) : null}

              <FormError message={submitError} />

              <div className="form__actions">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating plan..." : "Create plan"}
                </Button>
              </div>
            </form>
          </Card>
        </Section>

        <Section
          title="Active plans"
          description="These plans are available for future membership assignment flows."
          actions={
            <Button
              onClick={() => setReloadKey((currentValue) => currentValue + 1)}
              variant="secondary"
            >
              Refresh
            </Button>
          }
        >
          <Card>
            {isLoading ? (
              <LoadingState label="Loading plans..." />
            ) : loadError ? (
              <ErrorState
                title="Plans unavailable"
                description={loadError}
                action={
                  <Button
                    onClick={() => setReloadKey((currentValue) => currentValue + 1)}
                    variant="secondary"
                  >
                    Retry
                  </Button>
                }
              />
            ) : plans.length === 0 ? (
              <EmptyState
                title="No active plans yet"
                description="Create the first membership plan to start structuring memberships."
              />
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => (
                  <article className="plan-card" key={plan.id}>
                    <div className="plan-card__header">
                      <div>
                        <h3 className="plan-card__title">{plan.name}</h3>
                        <p className="plan-card__subtitle">
                          {formatBillingPeriod(plan.billingPeriod)}
                        </p>
                      </div>
                      <StatusPill
                        label={plan.isActive ? "Active" : "Inactive"}
                        tone={plan.isActive ? "positive" : "neutral"}
                      />
                    </div>

                    <p className="plan-card__price">
                      {formatCurrencyFromCents(plan.priceCents)}
                    </p>

                    <p className="plan-card__description">
                      {plan.description ?? "No description provided."}
                    </p>

                    <p className="plan-card__meta">
                      Created {formatDateTime(plan.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </Section>
      </div>
    </div>
  );
}

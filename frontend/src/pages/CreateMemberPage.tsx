import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiClientError, getErrorMessage } from "../api/client";
import { createMember } from "../api/members";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import type { CreateMemberInput } from "../types/members";
import { formatMemberName } from "../utils/format";

interface CreateMemberFormErrors {
  address?: string;
  age?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface CreateMemberFormValues {
  address: string;
  age: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (
  values: CreateMemberFormValues
): CreateMemberFormErrors => {
  const errors: CreateMemberFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  } else if (values.firstName.trim().length > 100) {
    errors.firstName = "First name must be at most 100 characters.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  } else if (values.lastName.trim().length > 100) {
    errors.lastName = "Last name must be at most 100 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (values.email.trim().length > 255) {
    errors.email = "Email must be at most 255 characters.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.age.trim()) {
    const age = Number(values.age);

    if (!Number.isInteger(age)) {
      errors.age = "Age must be a whole number.";
    } else if (age < 0 || age > 120) {
      errors.age = "Age must be between 0 and 120.";
    }
  }

  if (values.phoneNumber.trim().length > 30) {
    errors.phoneNumber = "Phone number must be at most 30 characters.";
  }

  if (values.address.trim().length > 255) {
    errors.address = "Address must be at most 255 characters.";
  }

  return errors;
};

export function CreateMemberPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateMemberFormValues>({
    address: "",
    age: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: ""
  });
  const [errors, setErrors] = useState<CreateMemberFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (
    field: keyof CreateMemberFormValues,
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

    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextValues: CreateMemberInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      age: values.age.trim() ? Number(values.age) : undefined,
      phoneNumber: values.phoneNumber.trim() || undefined,
      address: values.address.trim() || undefined
    };

    setIsSubmitting(true);
    setFormError(null);

    try {
      const createdMember = await createMember(nextValues);

      navigate(`/members/${createdMember.id}`, {
        state: {
          successMessage: `${formatMemberName(createdMember)} was created successfully.`
        }
      });
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.code === "MEMBER_EMAIL_ALREADY_EXISTS"
      ) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: error.message
        }));
      } else {
        setFormError(
          getErrorMessage(
            error,
            "We could not create the member. Please try again."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Create Member"
        title="Add a new member"
        description="Fill out the form below to create a new member in your gym."
        actions={
          <Link className="button button--secondary" to="/members">
            Back to members
          </Link>
        }
      />

      <Card>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__grid">
            <Field
              error={errors.firstName}
              htmlFor="firstName"
              label="First name"
            >
              <Input
                autoComplete="given-name"
                hasError={Boolean(errors.firstName)}
                id="firstName"
                maxLength={100}
                name="firstName"
                onChange={(event) =>
                  handleFieldChange("firstName", event.target.value)
                }
                placeholder="Jane"
                value={values.firstName}
              />
            </Field>

            <Field
              error={errors.lastName}
              htmlFor="lastName"
              label="Last name"
            >
              <Input
                autoComplete="family-name"
                hasError={Boolean(errors.lastName)}
                id="lastName"
                maxLength={100}
                name="lastName"
                onChange={(event) =>
                  handleFieldChange("lastName", event.target.value)
                }
                placeholder="Doe"
                value={values.lastName}
              />
            </Field>
          </div>

          <Field
            error={errors.email}
            htmlFor="email"
            hint="This must be unique."
            label="Email"
          >
            <Input
              autoComplete="email"
              hasError={Boolean(errors.email)}
              id="email"
              maxLength={255}
              name="email"
              onChange={(event) => handleFieldChange("email", event.target.value)}
              placeholder="jane.doe@example.com"
              type="email"
              value={values.email}
            />
          </Field>

          <div className="form__grid">
            <Field error={errors.age} htmlFor="age" label="Age">
              <Input
                hasError={Boolean(errors.age)}
                id="age"
                inputMode="numeric"
                maxLength={3}
                min="0"
                name="age"
                onChange={(event) => handleFieldChange("age", event.target.value)}
                placeholder="32"
                type="number"
                value={values.age}
              />
            </Field>

            <Field
              error={errors.phoneNumber}
              htmlFor="phoneNumber"
              label="Phone number"
            >
              <Input
                autoComplete="tel"
                hasError={Boolean(errors.phoneNumber)}
                id="phoneNumber"
                maxLength={30}
                name="phoneNumber"
                onChange={(event) =>
                  handleFieldChange("phoneNumber", event.target.value)
                }
                placeholder="+1 555 123 4567"
                value={values.phoneNumber}
              />
            </Field>
          </div>

          <Field error={errors.address} htmlFor="address" label="Address">
            <Input
              autoComplete="street-address"
              hasError={Boolean(errors.address)}
              id="address"
              maxLength={255}
              name="address"
              onChange={(event) => handleFieldChange("address", event.target.value)}
              placeholder="123 Main Street, Springfield"
              value={values.address}
            />
          </Field>

          <FormError message={formError} />

          <div className="form__actions">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating member..." : "Create member"}
            </Button>
            <Link className="button button--ghost" to="/members">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

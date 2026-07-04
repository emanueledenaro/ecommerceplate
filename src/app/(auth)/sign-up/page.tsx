"use client";

import { CustomerError } from "@/lib/shopify/types";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useTranslations } from "next-intl";

export interface FormData {
  firstName?: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const router = useRouter();
  const t = useTranslations("auth");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<CustomerError[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/customer/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setErrorMessages([]);
        router.push("/");
      } else {
        const errors = (responseData.errors as CustomerError[]) || [];
        setErrorMessages(errors);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="col-11 sm:col-9 md:col-7 mx-auto">
            <div className="mb-14 text-center">
              <h2 className="max-md:h1 md:mb-2">{t("signupTitle")}</h2>
              <p className="md:text-lg text-text-light ">
                {t("signupSubtitle")}
              </p>
            </div>

            <form
              onSubmit={handleSignUp}
              noValidate
              className="border border-border  rounded-2xl p-10"
            >
              <div>
                <label htmlFor="firstName" className="form-label">
                  {t("nameLabel")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  className={`form-input ${errorMessages.some((e) => e.field?.includes("firstName")) ? "border-error focus:ring-error/50" : ""}`}
                  placeholder={t("namePlaceholder")}
                  type="text"
                  onChange={handleChange}
                  value={formData.firstName}
                  aria-invalid={errorMessages.some((e) =>
                    e.field?.includes("firstName"),
                  )}
                  aria-describedby={
                    errorMessages.length > 0 ? "signup-errors" : undefined
                  }
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="form-label mt-8">
                  {t("emailLabel")}
                </label>
                <input
                  id="signup-email"
                  name="email"
                  className={`form-input ${errorMessages.some((e) => e.field?.includes("email")) ? "border-error focus:ring-error/50" : ""}`}
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  onChange={handleChange}
                  value={formData.email}
                  aria-invalid={errorMessages.some((e) =>
                    e.field?.includes("email"),
                  )}
                  aria-describedby={
                    errorMessages.length > 0 ? "signup-errors" : undefined
                  }
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="form-label mt-8">
                  {t("passwordLabel")}
                </label>
                <input
                  id="signup-password"
                  name="password"
                  className={`form-input ${errorMessages.some((e) => e.field?.includes("password")) ? "border-error focus:ring-error/50" : ""}`}
                  placeholder={t("createPassword")}
                  type="password"
                  onChange={handleChange}
                  value={formData.password}
                  aria-invalid={errorMessages.some((e) =>
                    e.field?.includes("password"),
                  )}
                  aria-describedby={
                    errorMessages.length > 0 ? "signup-errors" : undefined
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              {errorMessages.length > 0 && (
                <div
                  id="signup-errors"
                  role="alert"
                  aria-live="polite"
                  className="mt-4 space-y-2"
                >
                  {errorMessages.map((error: CustomerError) => (
                    <p
                      key={error.code}
                      className="font-medium text-error  text-sm flex items-start gap-2"
                    >
                      <span aria-hidden="true">*</span>
                      <span>{error.message}</span>
                    </p>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary md:text-lg md:font-medium w-full mt-10 focus:outline-none focus:ring-2 focus:ring-primary/50  min-h-[44px]"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <BiLoaderAlt
                      className="animate-spin mx-auto"
                      size={26}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{t("signingUp")}</span>
                  </>
                ) : (
                  t("signupButton")
                )}
              </button>
            </form>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm md:text-base mt-6">
              <div className="flex gap-x-2">
                <p className="text-text-light ">{t("hasAccount")}</p>
                <Link
                  className="underline font-medium text-primary hover:text-primary_hover   transition-colors"
                  href={"/login"}
                >
                  {t("login")}
                </Link>
              </div>

              <div className="md:text-right">
                <p className="text-text-light ">
                  {t("termsAccept")}{" "}
                  <Link
                    className="underline font-medium text-primary hover:text-primary_hover   transition-colors"
                    href={"/terms-services"}
                  >
                    {t("termsLink")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;

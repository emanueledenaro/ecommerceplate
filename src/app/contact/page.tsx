import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import { getMetadataAlternates } from "@/lib/i18n/metadata";
import { markdownify } from "@/lib/utils/textConverter";
import PageHeader from "@/partials/PageHeader";
import SeoMeta from "@/partials/SeoMeta";
import { ContactUsItem, RegularPage } from "@/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const generateMetadata = async (): Promise<Metadata> => {
  const data: RegularPage = getListPage("contact/_index.md");
  const title = data.frontmatter.meta_title || data.frontmatter.title;
  const description =
    data.frontmatter.description || data.frontmatter.title || "";

  return {
    title,
    description,
    alternates: getMetadataAlternates("/contact"),
  };
};

const Contact = async () => {
  const data: RegularPage = getListPage("contact/_index.md");
  const { frontmatter } = data;
  const { title, description, meta_title, image, contact_meta } = frontmatter;
  const { contact_form_action } = config.params;
  const t = await getTranslations("contactPage");

  return (
    <>
      <SeoMeta
        title={title}
        meta_title={meta_title}
        description={description}
        image={image}
      />
      <PageHeader title={title} />
      <section className="pt-12 xl:pt-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contact_meta &&
              contact_meta?.map((contact: ContactUsItem) => (
                <div
                  key={contact.name}
                  className="p-10 bg-light  rounded-2xl text-center"
                >
                  <p
                    dangerouslySetInnerHTML={markdownify(contact.name)}
                    className="mb-6 h3 font-medium text-text-dark "
                  />
                  <p dangerouslySetInnerHTML={markdownify(contact.contact)} />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mx-auto lg:col-10">
            <h2 className="mb-14 text-center">{t("title")}</h2>

            <form
              className="border border-border  rounded-2xl p-10"
              action={contact_form_action}
              method="POST"
            >
              <div className="mb-6 md:grid grid-cols-2 gap-x-8 max-md:space-y-6">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    {t("firstName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    placeholder={t("firstNamePlaceholder")}
                    type="text"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    {t("lastName")}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    placeholder={t("lastNamePlaceholder")}
                    type="text"
                  />
                </div>
              </div>

              <div className="mb-6 md:grid grid-cols-2 gap-x-8 max-md:space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder={t("emailPlaceholder")}
                    type="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="form-label">
                    {t("subject")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    className="form-input"
                    placeholder={t("subjectPlaceholder")}
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="form-label">
                  {t("message")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input"
                  placeholder={t("messagePlaceholder")}
                  rows={8}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  {t("send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;

import MDXContent from "@/helpers/MDXContent";
import { getSinglePage } from "@/lib/contentParser";
import { getMetadataAlternates } from "@/lib/i18n/metadata";
import PageHeader from "@/partials/PageHeader";
import SeoMeta from "@/partials/SeoMeta";
import { RegularPage } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Generate static params
export const generateStaticParams = () => {
  const regularPages = getSinglePage("pages").map((page: RegularPage) => ({
    regular: page.slug,
  }));
  return regularPages;
};

export const generateMetadata = async (props: {
  params: Promise<{ regular: string }>;
}): Promise<Metadata> => {
  const { regular } = await props.params;
  const regularData = getSinglePage("pages");
  const data = regularData.find((page: RegularPage) => page.slug === regular);

  if (!data) {
    return {};
  }

  const { frontmatter } = data;
  const title = frontmatter.meta_title || frontmatter.title;
  const description = frontmatter.description || frontmatter.title || "";

  return {
    title,
    description,
    alternates: getMetadataAlternates(`/${regular}`),
  };
};

// For all regular pages
const RegularPages = async (props: {
  params: Promise<{ regular: string }>;
}) => {
  const params = await props.params;
  const regularData = getSinglePage("pages");
  const data = regularData.find(
    (page: RegularPage) => page.slug === params.regular,
  );

  if (!data) return notFound();

  const { frontmatter, content } = data;
  const { title, meta_title, description, image } = frontmatter;

  return (
    <>
      <SeoMeta
        title={title}
        meta_title={meta_title}
        description={description}
        image={image}
      />
      <PageHeader title={title} />
      <section className="section">
        <div className="container">
          <div className="content">
            <MDXContent content={content} />
          </div>
        </div>
      </section>
    </>
  );
};

export default RegularPages;

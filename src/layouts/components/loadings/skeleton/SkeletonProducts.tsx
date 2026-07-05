import SkeletonCards from "./SkeletonCards";

const bar = "animate-pulse rounded bg-neutral-200";

// Rispecchia la pagina /products: CategoryHeader + sidebar filtri + barra
// (conteggio/ordinamento) + griglia card.
const SkeletonProducts = () => {
  return (
    <>
      {/* CategoryHeader */}
      <section>
        <div className="text-center">
          <div className="bg-gradient-to-b from-body to-light px-8 py-14 md:py-20">
            <div className={`mx-auto mb-4 h-10 w-2/3 md:h-12 lg:h-14 ${bar}`} />
            <div className={`mx-auto mb-6 h-5 w-3/4 max-w-2xl md:h-6 ${bar}`} />
            <div className={`mx-auto mb-6 h-5 w-32 ${bar}`} />
            <div className={`mx-auto mt-6 h-4 w-48 ${bar}`} />
          </div>
        </div>
      </section>

      {/* Sidebar + griglia */}
      <div className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            {/* Sidebar filtri */}
            <aside className="lg:w-64 lg:shrink-0">
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className={`mb-5 h-4 w-20 ${bar}`} />

                {/* Faccette */}
                <div className="mb-6">
                  <div className={`mb-3 h-3 w-24 ${bar}`} />
                  <div className="flex flex-col gap-2.5">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className={`h-5 w-28 ${bar}`} />
                          <div className={`h-5 w-6 rounded-full ${bar}`} />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mb-6 h-px bg-border" />

                {/* Prezzo */}
                <div>
                  <div className={`mb-4 h-3 w-16 ${bar}`} />
                  <div className="mb-3 flex justify-between">
                    <div className={`h-4 w-16 ${bar}`} />
                    <div className={`h-4 w-16 ${bar}`} />
                  </div>
                  <div className={`h-2 w-full rounded-full ${bar}`} />
                </div>
              </div>
            </aside>

            {/* Griglia prodotti */}
            <div className="grow">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className={`h-5 w-24 ${bar}`} />
                <div className={`h-11 w-40 rounded-full ${bar}`} />
              </div>
              <SkeletonCards />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonProducts;

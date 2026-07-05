// Rispecchia ProductCard: immagine quadrata, titolo su 2 righe (min-height
// come la card reale), riga prezzo + bottone. Niente color swatch (opzionali).
const SkeletonCards = () => {
  return (
    <div className="row gy-5">
      {Array(9)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="col-12 sm:col-6 md:col-4">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-white">
              {/* Immagine quadrata */}
              <div className="aspect-square animate-pulse bg-neutral-200" />

              {/* Info box */}
              <div className="flex flex-1 flex-col gap-2 p-3 md:gap-3 md:p-4">
                {/* Titolo 2 righe (min-h come la card reale) */}
                <div className="min-h-[40px] space-y-2 md:min-h-[56px]">
                  <div className="h-4 w-full animate-pulse rounded bg-neutral-200 md:h-5" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 md:h-5" />
                </div>

                {/* Prezzo + bottone */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="h-7 w-24 animate-pulse rounded bg-neutral-200 md:h-8" />
                  <div className="h-9 w-full animate-pulse rounded-full bg-neutral-200 sm:w-28 md:h-11 md:w-32" />
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SkeletonCards;

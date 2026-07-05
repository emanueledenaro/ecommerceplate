// Rispecchia CollectionsSlider: griglia 3x2 su mobile, riga su desktop,
// cerchi con anello + etichetta sotto.
const SkeletonCategory = () => {
  return (
    <ul className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-6 md:flex md:justify-center md:gap-6">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <li
            key={index}
            className="flex w-full max-w-32 flex-col items-center sm:max-w-36 md:w-40 md:max-w-none"
          >
            <div className="rounded-full bg-neutral-100 p-[3px] shadow-md">
              <div className="rounded-full bg-body p-1">
                <div className="aspect-square w-24 animate-pulse rounded-full bg-neutral-200 sm:w-28 md:w-32" />
              </div>
            </div>
            <div className="mt-3 h-4 w-16 animate-pulse rounded bg-neutral-200" />
          </li>
        ))}
    </ul>
  );
};

export default SkeletonCategory;

const BRANDS = [
  { name: "Amazon", slug: "amazon" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "Pizza 4P's", slug: "pizza-4ps" },
  { name: "InVideo", slug: "invideo" },
  { name: "Nilgiris", slug: "nilgiris" },
  { name: "IIM Bangalore", slug: "iimb" },
  { name: "Whizard", slug: "whizard" },
  { name: "Zostel", slug: "zostel" },
  { name: "Himalayan Highest Race", slug: "himalayan-highest-race" },
  { name: "Unwind India", slug: "unwind-india" },
  { name: "Lagori", slug: "lagori" },
  { name: "Genesis Photobooks", slug: "genesis-photobooks" },
  { name: "Shutterbeat Stories", slug: "shutterbeat-stories" },
  { name: "Vahan", slug: "vahan" },
  { name: "Digital Harbor", slug: "digital-harbor" },
  { name: "Prani Pet Sanctuary", slug: "prani-pet-sanctuary" },
  { name: "Aurralis", slug: "aurrailis" },
  { name: "Reverich", slug: "reverich" },
  { name: "SELCO Foundation", slug: "selco-foundation" },
  { name: "Tie In", slug: "tie-in" },
  { name: "The Story Bull", slug: "the-story-bull" },
  { name: "ACME Constructions", slug: "acme-constructions" },
  { name: "Digital Academy 360", slug: "digital-academy360" },
  { name: "Federate One", slug: "federate-one" },
  { name: "Nari Yari", slug: "nari-yari" },
  { name: "IDB", slug: "idb" },
  { name: "REE", slug: "ree" },
  { name: "Papered", slug: "papered" },
  { name: "Eyo", slug: "eyo" },
  { name: "Artworks", slug: "artwork-mark" },
  { name: "Client brand", slug: "a-mark" },
] as const;

function LogoRow({
  brands,
  reverse = false,
}: {
  brands: readonly (typeof BRANDS)[number][];
  reverse?: boolean;
}) {
  const repeatedBrands = [...brands, ...brands];

  return (
    <div className="brand-logo-viewport">
      <div className={`brand-logo-track ${reverse ? "brand-logo-track-reverse" : ""}`}>
        {repeatedBrands.map((brand, index) => (
          <div
            key={`${brand.slug}-${index}`}
            className="group flex h-24 w-40 shrink-0 items-center justify-center px-5 md:h-28 md:w-52 md:px-7"
            aria-hidden={index >= brands.length}
          >
            <img
              src={`/brand-logos/${brand.slug}.png`}
              alt={index < brands.length ? brand.name : ""}
              className="brand-logo-image max-h-14 max-w-full object-contain md:max-h-16"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandLogoShowcase() {
  const firstRow = BRANDS.filter((_, index) => index % 2 === 0);
  const secondRow = BRANDS.filter((_, index) => index % 2 === 1);

  return (
    <section id="clients" className="overflow-hidden border-t border-white/5 bg-black py-24 md:py-32">
      <div className="container mx-auto mb-14 px-6 md:px-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em]" style={{ color: "#E8572A" }}>
          Selected Clients
        </p>
        <h2 className="max-w-3xl text-4xl font-bold tracking-tighter text-white font-display md:text-6xl">
          Brands we've<br />
          <span className="text-gray-500">worked with.</span>
        </h2>
      </div>

      <div className="space-y-3">
        <LogoRow brands={firstRow} />
        <LogoRow brands={secondRow} reverse />
      </div>
    </section>
  );
}
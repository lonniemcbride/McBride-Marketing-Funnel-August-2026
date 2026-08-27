import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-prussian-blue px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold tracking-widest text-marigold uppercase">
          Where Your Purpose Is Our Mission
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Cleared careers, matched by a person — not a keyword scan.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
          Choose the track that fits the work you&rsquo;re looking for.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Link
            href="/nato"
            className="rounded-lg border border-white/20 bg-white/5 p-8 text-left transition-colors hover:bg-white/10"
          >
            <h2 className="text-xl font-bold">McBride International</h2>
            <p className="mt-2 text-sm text-white/70">
              NATO contract staffing — cleared careers across Europe and
              allied programs, entry to principal level.
            </p>
            <span className="mt-4 inline-block font-bold text-marigold">
              Explore NATO roles &rarr;
            </span>
          </Link>

          <Link
            href="/air-force"
            className="rounded-lg border border-white/20 bg-white/5 p-8 text-left transition-colors hover:bg-white/10"
          >
            <h2 className="text-xl font-bold">McBride</h2>
            <p className="mt-2 text-sm text-white/70">
              U.S. Air Force contract staffing — cleared careers stateside,
              entry to principal level.
            </p>
            <span className="mt-4 inline-block font-bold text-marigold">
              Explore Air Force roles &rarr;
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

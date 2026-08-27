import Link from "next/link";

export interface LandingContent {
  eyebrow: string;
  subheadline: string;
  problemBody: string[];
  builtForBody: string;
  builtForHeading: string;
  surveyHref: string;
}

const steps = [
  {
    title: "1. Tell us who you are",
    body: "Complete a short profile — your clearance, your background, and honestly, why this kind of work matters to you. It's a profile, not an application to one specific job.",
  },
  {
    title: "2. Get matched by a person",
    body: "A recruiter who's actually read your profile — not scanned it for keywords — reaches out about roles that fit where you are and where you want to go.",
  },
  {
    title: "3. A real conversation before anything goes anywhere",
    body: "Think of it as your pre-interview. You'll know whether a role is worth pursuing before your name goes anywhere near the client.",
  },
  {
    title: "4. We submit you with proof, not just a resume",
    body: "Every submission includes a short dossier built from your profile and that conversation — so the hiring team already understands why you're a fit before you're ever on a call with them.",
  },
];

const whyBetter = [
  "Fewer interviews for roles you were never right for in the first place.",
  "You see what's being said about you — nothing goes to a client without you knowing what's in it.",
  "We vet for fit, not just for clearance.",
];

const faqs = [
  {
    q: "How long does the profile take?",
    a: "About 8–12 minutes. If you're matched to a specific role afterward, there may be a few quick follow-up questions — never a second full form.",
  },
  {
    q: "Do I need to already hold a clearance?",
    a: "No. We work with candidates at every stage, including those who don't yet hold a clearance. Tell us your status as it is today.",
  },
  {
    q: "Will you share my information with anyone without telling me?",
    a: "No. Before anything is shared with a hiring organization, you'll know what's in it. Nothing goes out without your consent.",
  },
  {
    q: "What if I'm not a fit for anything right now?",
    a: "You'll hear that from a person, with a reason — not silence. Your profile stays on file so we can reach out when something fits.",
  },
  {
    q: "Is this a job board?",
    a: "No. You're not applying to a single posting into a queue. You're building a profile a recruiter actually uses to find where you fit.",
  },
];

export function LandingTemplate({ content }: { content: LandingContent }) {
  return (
    <>
      {/* Hero */}
      <section className="bg-prussian-blue text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-bold tracking-widest text-marigold uppercase">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Where Your Purpose Is Our Mission.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
            {content.subheadline}
          </p>
          <Link
            href={content.surveyHref}
            className="mt-8 inline-block rounded-md bg-marigold px-8 py-3 text-base font-bold text-prussian-blue transition-colors hover:bg-white"
          >
            Start Your Profile
          </Link>
          <p className="mt-3 text-sm text-white/60">
            Takes 8–12 minutes. No resume blast. No black hole. Just one
            conversation that actually goes somewhere.
          </p>
        </div>
      </section>

      {/* The problem, named */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-prussian-blue sm:text-3xl">
            You&rsquo;ve done this before.
          </h2>
          {content.problemBody.map((p, i) => (
            <p
              key={i}
              className={
                i === content.problemBody.length - 1
                  ? "mt-4 font-semibold text-independence"
                  : "mt-4 text-black/80"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* How McBride works */}
      <section className="bg-black/[.03]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-prussian-blue sm:text-3xl">
            Four steps, and a real person at every one of them.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-lg border border-black/10 bg-white p-6"
              >
                <h3 className="font-bold text-mcbride-blue">{step.title}</h3>
                <p className="mt-2 text-black/75">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it's actually better for you */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-prussian-blue sm:text-3xl">
            Why it&rsquo;s actually better for you
          </h2>
          <ul className="mt-6 space-y-4">
            {whyBetter.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1 h-2 w-2 flex-none rounded-full bg-android-green"
                />
                <span className="text-black/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Built for cleared careers */}
      <section className="bg-independence text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {content.builtForHeading}
          </h2>
          <p className="mt-4 text-white/85">{content.builtForBody}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-prussian-blue sm:text-3xl">
            FAQ
          </h2>
          <div className="mt-6 divide-y divide-black/10">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-independence">
                  {faq.q}
                  <span className="ml-4 text-mcbride-blue transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-black/75">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-prussian-blue text-white">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Your purpose already exists. Let&rsquo;s find the mission that
            matches it.
          </h2>
          <Link
            href={content.surveyHref}
            className="mt-8 inline-block rounded-md bg-marigold px-8 py-3 text-base font-bold text-prussian-blue transition-colors hover:bg-white"
          >
            Start Your Profile
          </Link>
        </div>
      </section>
    </>
  );
}

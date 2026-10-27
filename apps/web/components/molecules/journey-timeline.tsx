import { historyPage } from "@repo/database";

export function JourneyTimeline() {
  return (
    <ol className="ml-3 space-y-10 border-l-2 border-shop-dark-green/20">
      {historyPage.journey.map((step) => (
        <li key={`${step.period}-${step.title}`} className="relative ml-8">
          <span
            aria-hidden
            className="absolute -left-10.25 top-1.5 size-4 rounded-full bg-shop-dark-green ring-4 ring-shop-light-pink"
          />
          <p className="text-sm font-semibold uppercase tracking-widest text-shop-dark-green">
            {step.period}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-shop-dark-green">{step.title}</h3>
          <p className="mt-2 leading-relaxed text-darkColor/90">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
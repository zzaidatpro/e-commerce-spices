interface HistoryEvent {
  id: string;
  year: string | number;
  title: string;
  description: string;
}

export function Timeline({ events }: { events: HistoryEvent[] }) {
  return (
    <div className="relative border-l-2 border-shop-orange/40 ml-4 md:ml-32 my-8 space-y-8">
      {events.map((event) => (
        <div key={event.id} className="relative pl-6 group">
          <div className="absolute -left-2.25 top-1.5 h-4 w-4 rounded-full border-2 border-shop-orange bg-background group-hover:bg-shop-orange transition-colors" />
          <div className="md:absolute md:-left-36 md:top-1 md:w-28 md:text-right font-extrabold text-shop-orange text-lg">
            {event.year}
          </div>
          <div className="bg-background border border-border/50 p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-foreground mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
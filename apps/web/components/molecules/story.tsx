import Image from "next/image";
import Link from "next/link";
import { homeContent } from "@repo/database";

export function TejPattaStory() {
  const { story } = homeContent;

  return (  
    <section className="bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted md:aspect-auto md:h-128 shadow-md">
          <Image
            src="/images/tejpatta_story.jpg"
            alt="tejpatta story"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{story.title}</h2>
          <p className="text-lg leading-relaxed opacity-90">{story.text}</p>
                 
          <Link
            href={story.ctaHref}
            className="inline-flex items-center justify-center rounded-md border border-primary bg-transparent px-6 py-3 text-lg font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {story.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
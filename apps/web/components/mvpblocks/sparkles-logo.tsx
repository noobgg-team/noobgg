import { SparklesCore } from "@/components/ui/sparkles";

import Image from "next/image";

export default function SparklesLogo() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="mx-auto mt-10 w-screen max-w-4xl">
        <div className="text-center text-3xl text-white">
          <span className="text-[#6f52f4]">
            Pick Your Game. Find Your People.
          </span>
        </div>

        <div className="flex justify-center max-w-4xl gap-x-6 mt-12">
          {[
            { src: "/logos/valorant.svg", alt: "Valorant Logo" },
            { src: "/logos/lol.svg", alt: "League of Legends Logo" },
            { src: "/logos/fortnite.svg", alt: "Fortnite" },
            { src: "/logos/pubg.svg", alt: "PlayerUnknown's Battlegrounds" },
            { src: "/logos/cs.svg", alt: "Counter Strike 2" }
          ].map(({ src, alt }) => (
            <div key={src} className="relative h-auto w-auto aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1] py-3 lg:py-5 mx-auto sm:mx-0">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative -mt-32 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#6f52f4,transparent_70%)] before:opacity-40 after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-[#9b87f5] after:bg-zinc-900">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          particleDensity={300}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </div>
    </div>
  );
}

import Image from "next/image";
import { profile } from "@/content/profile";

/**
 * The portrait photo is shot on plain white. Multiplying it over a warm champagne light turns
 * that backdrop into a soft studio wash while the subject keeps its natural colour: the light is
 * near-white where the face sits and only deepens towards the edges, so skin tones barely move.
 * The photo itself is never cropped beyond `object-cover` or retouched.
 */
export function PortraitPhoto({
  src,
  sizes,
  priority = false,
  position = "50% 20%",
}: {
  src: string;
  sizes: string;
  priority?: boolean;
  position?: string;
}) {
  return (
    <div className="absolute inset-0 isolate bg-[radial-gradient(ellipse_75%_60%_at_50%_24%,#fffbf3_0%,#f5e8d0_48%,#d6bd93_100%)]">
      <Image
        src={src}
        alt={`Portrait of ${profile.name}`}
        fill
        sizes={sizes}
        quality={90}
        {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
        className="object-cover mix-blend-multiply"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

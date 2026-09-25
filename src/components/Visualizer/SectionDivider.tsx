import { Visualizer } from "./Visualizer";
import { cn } from "@/lib/utils";

type Props = { className?: string; palette?: "neon" | "red" | "cyan"; label?: string };

/**
 * Divisor entre seções:
 * ━━━━━━━━━━━━━━━━━━━━
 * ▂ ▅ █ ▇ ▆ █ ▅ ▂ ▇ █
 * ━━━━━━━━━━━━━━━━━━━━
 */
export function SectionDivider({ className, palette = "neon", label }: Props) {
  return (
    <div className={cn("container-bb", className)} aria-hidden={label ? undefined : true}>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-line-strong to-line-strong" />
        <div className="w-40 sm:w-56">
          <Visualizer bars={24} height="1.75rem" palette={palette} />
        </div>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-line-strong to-line-strong" />
      </div>
      {label ? <p className="hud mt-3 text-center text-dim">{label}</p> : null}
    </div>
  );
}

"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "target" | "rel"> & {
  href: string;
  /** Evento de analytics disparado no clique. */
  event: AnalyticsEvent;
  eventParams?: Record<string, string | number | boolean>;
  /** Abre em nova aba com rel seguro. */
  external?: boolean;
  children: ReactNode;
};

/** Link comum com rastreamento de clique — ilha client mínima para seções renderizadas no servidor. */
export function TrackedLink({ event, eventParams, external, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => track(event, eventParams)}
    >
      {children}
    </a>
  );
}

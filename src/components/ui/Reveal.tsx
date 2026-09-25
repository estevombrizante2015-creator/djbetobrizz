import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Escalona a entrada: 1 (padrão), 2 ou 3 entram um pouco depois ao rolar. */
  step?: 1 | 2 | 3;
  as?: "div" | "li" | "article" | "p" | "span";
};

/**
 * Entrada suave ao rolar (fade + slide) em CSS puro — `animation-timeline: view()`,
 * sem JavaScript e sem custo por frame. Só anima no modo completo (html[data-perf="full"]);
 * no modo leve, com movimento reduzido ou sem suporte, o conteúdo já nasce visível.
 */
export function Reveal({ children, className, step = 1, as: Tag = "div" }: Props) {
  return <Tag className={cn("reveal", step === 2 && "reveal-2", step === 3 && "reveal-3", className)}>{children}</Tag>;
}

"use client";

import { useEffect } from "react";

/**
 * Âncoras (#eventos, #contato…) caindo no lugar certo apesar do `content-visibility: auto`.
 *
 * As seções adiadas (<Deferred> em page.tsx, classe .cv-auto) ocupam só o tamanho reservado
 * (contain-intrinsic-size) até serem renderizadas. A rolagem suave até uma âncora calcula o destino
 * com esses tamanhos provisórios e, quando as seções no caminho renderizam com a altura real, o
 * alvo "foge" milhares de pixels para baixo.
 *
 * Solução: no clique em um link de âncora (fase de captura, ANTES da navegação padrão), liga
 * `html.cv-off` — que renderiza todas as seções (ver globals.css) — e força o layout, para o
 * navegador calcular o destino com as alturas reais. Sem preventDefault: hash, ponto de foco,
 * `scroll-behavior` e movimento reduzido continuam nativos. A classe sai no fim da rolagem
 * (scrollend, ou 3 s no máximo); as seções guardam a última altura medida (contain-intrinsic-size:
 * auto), então nada volta a encolher. Também corrige o link direto (/#contato) ao abrir a página.
 *
 * Não renderiza nada e não roda nada por frame — só um listener de clique (e o custo de renderizar
 * as seções adiadas uma vez, no momento do salto que o visitante pediu).
 */
export function AnchorNavigation() {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    let raf = 0;
    const off = () => root.classList.remove("cv-off");
    // Tira a classe só depois de pelo menos um quadro completo com as seções renderizadas: a
    // "última altura" (contain-intrinsic-size: auto) é gravada no passo de ResizeObserver do quadro.
    // Num salto instantâneo o scrollend chega ANTES desse passo — remover ali encolheria tudo de volta.
    const release = () => {
      window.removeEventListener("scrollend", release);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(off);
      });
    };
    const expand = () => {
      cancelAnimationFrame(raf);
      root.classList.add("cv-off");
      void root.offsetHeight; // alturas reais antes de o navegador calcular o destino da âncora
      window.removeEventListener("scrollend", release);
      window.addEventListener("scrollend", release, { once: true });
      window.clearTimeout(timer);
      timer = window.setTimeout(release, 3000);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (link && (link.getAttribute("href") ?? "").length > 1) expand();
    };
    document.addEventListener("click", onClick, true);

    // Link direto (/#contato): a rolagem inicial do navegador usou os tamanhos provisórios.
    // Enquanto a página carrega ela fica instantânea (`data-hash-jump`, gravado pelo script de
    // PERF_TIER_SCRIPT): o navegador repete o salto a cada layout até o `load`, agora já com as
    // alturas reais; depois disso a rolagem suave volta a valer para os cliques.
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      id = "";
    }
    const target = id ? document.getElementById(id) : null;
    if (target) {
      expand();
      target.scrollIntoView({ block: "start", behavior: "instant" });
    }
    let jumpRaf = 0;
    const endHashJump = () => {
      jumpRaf = requestAnimationFrame(() => {
        jumpRaf = requestAnimationFrame(() => root.removeAttribute("data-hash-jump"));
      });
    };
    if (root.hasAttribute("data-hash-jump")) {
      if (document.readyState === "complete") endHashJump();
      else window.addEventListener("load", endHashJump, { once: true });
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scrollend", release);
      window.removeEventListener("load", endHashJump);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(jumpRaf);
      off();
    };
  }, []);

  return null;
}

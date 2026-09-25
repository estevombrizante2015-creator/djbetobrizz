"use client";

import { useEffect, useState } from "react";

/** Linha de leitura (fração da altura da tela): a seção ativa é a última cujo topo passou dela. */
const LINE = 0.4;

/** Ordena elementos pela posição no documento (o menu pode listar em outra ordem). */
function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * Seção ativa do menu (LED aceso).
 * Um IntersectionObserver vigia uma faixa fina na linha de leitura; sempre que o topo ou a base
 * de uma seção cruza essa faixa, a seção ativa é recalculada. No fim da página, ativa a última.
 * Também informa quais âncoras não existem na página (o menu oculta esses itens).
 */
export function useActiveSection(ids: readonly string[]) {
  const key = ids.join("|");
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const list = key.split("|");
    const els = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .sort(byDocumentOrder);
    const found = new Set(els.map((el) => el.id));
    const absent = list.filter((id) => !found.has(id));
    // atualização adiada: evita render em cascata dentro do efeito
    const raf = absent.length ? requestAnimationFrame(() => setMissing(absent)) : 0;
    if (!els.length) return () => cancelAnimationFrame(raf);

    const atPageEnd = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const update = () => {
      if (atPageEnd()) {
        setActive(els[els.length - 1].id);
        return;
      }
      // a faixa do observer vai de LINE a LINE + 1%: usar a borda de baixo evita "atrasos" de 1 frame
      const line = window.innerHeight * (LINE + 0.01);
      let current = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el;
      }
      setActive(current.id);
    };

    const top = Math.round(LINE * 100);
    const io = new IntersectionObserver(update, { rootMargin: `-${top}% 0px -${99 - top}% 0px` });
    els.forEach((el) => io.observe(el));

    // o fim da página nem sempre cruza a faixa (última seção curta): checagem barata no scroll
    let wasAtEnd = false;
    const onScroll = () => {
      const end = atPageEnd();
      if (end !== wasAtEnd) {
        wasAtEnd = end;
        update();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return { active, missing };
}

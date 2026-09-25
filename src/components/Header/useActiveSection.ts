"use client";

import { useEffect, useState } from "react";

/**
 * Seção ativa do menu: observa as âncoras da one-page com IntersectionObserver
 * numa faixa fina próxima ao topo da tela. No fim da página, ativa a última.
 * Também informa quais âncoras existem de fato (itens sem seção são ocultados).
 */
export function useActiveSection(ids: readonly string[]) {
  const key = ids.join("|");
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const list = key.split("|");
    const els = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const found = new Set(els.map((el) => el.id));
    const absent = list.filter((id) => !found.has(id));
    // atualização adiada: evita render em cascata dentro do efeito
    const raf = requestAnimationFrame(() => setMissing(absent));
    if (!els.length) return () => cancelAnimationFrame(raf);

    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const current = els.filter((el) => visible.get(el.id)).pop();
        if (current) setActive(current.id);
      },
      { rootMargin: "-32% 0px -62% 0px" },
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => {
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        setActive(els[els.length - 1].id);
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

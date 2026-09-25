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
 *
 * Um IntersectionObserver vigia uma faixa fina na linha de leitura; nenhum trabalho por rolagem.
 * - Seção vigiada na faixa → é a ativa.
 * - Faixa sobre uma seção fora do menu (ou um divisor) → um único teste de ponto na linha de
 *   leitura diz qual seção vigiada vem antes dela no documento. Nada de medir as seções com
 *   getBoundingClientRect (forçaria o layout de seções fora da tela, inclusive as puladas por
 *   `content-visibility`).
 * - Seções `neutral` (fora do menu, ex.: #impacto) apagam o LED enquanto estão na faixa.
 * - No fim da página ativa o último item (checado só enquanto o <footer> está visível).
 * Também informa quais âncoras não existem na página (o menu oculta esses itens).
 */
export function useActiveSection(ids: readonly string[], neutral: readonly string[] = []) {
  const key = ids.join("|");
  const neutralKey = neutral.join("|");
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const list = key.split("|");
    const neutralIds = new Set(neutralKey ? neutralKey.split("|") : []);
    const byId = (id: string) => document.getElementById(id);
    const navEls = list.map(byId).filter((el): el is HTMLElement => el !== null);
    const found = new Set(navEls.map((el) => el.id));
    const absent = list.filter((id) => !found.has(id));
    // atualização adiada: evita render em cascata dentro do efeito
    const raf = absent.length ? requestAnimationFrame(() => setMissing(absent)) : 0;
    if (!navEls.length) return () => cancelAnimationFrame(raf);

    const neutralEls = [...neutralIds].map(byId).filter((el): el is HTMLElement => el !== null);
    const els = [...navEls, ...neutralEls].sort(byDocumentOrder);
    const lastNav = navEls.slice().sort(byDocumentOrder)[navEls.length - 1];

    const inBand = new Set<Element>();
    let current = -1; // índice em `els` da seção ativa
    let atEnd = false;

    const commit = () => {
      if (atEnd) {
        setActive(lastNav.id);
        return;
      }
      const el = els[current];
      if (el) setActive(neutralIds.has(el.id) ? "" : el.id);
    };

    /** Última seção vigiada que começa antes do ponto na linha de leitura (ou o contém). */
    const resolveFromPoint = () => {
      const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * (LINE + 0.005));
      if (!hit) return;
      els.forEach((el, i) => {
        if (el === hit || el.compareDocumentPosition(hit) & Node.DOCUMENT_POSITION_FOLLOWING) current = i;
      });
    };

    const top = Math.round(LINE * 100);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        }
        if (inBand.size) current = Math.max(...Array.from(inBand, (el) => els.indexOf(el as HTMLElement)));
        else resolveFromPoint();
        commit();
      },
      { rootMargin: `-${top}% 0px -${99 - top}% 0px` },
    );
    els.forEach((el) => io.observe(el));

    // Fim da página (a última seção pode ser curta e nunca cruzar a faixa).
    // O listener de rolagem só existe enquanto o rodapé está na tela.
    const atPageEnd = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const onScroll = () => {
      const end = atPageEnd();
      if (end !== atEnd) {
        atEnd = end;
        commit();
      }
    };
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return;
      }
      window.removeEventListener("scroll", onScroll);
      if (atEnd) {
        atEnd = false;
        commit();
      }
    };
    const footer = document.querySelector("footer");
    const endIo = footer ? new IntersectionObserver(([entry]) => listen(entry.isIntersecting)) : null;
    if (footer && endIo) endIo.observe(footer);
    else listen(true);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      endIo?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key, neutralKey]);

  return { active, missing };
}

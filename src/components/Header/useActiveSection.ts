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
 * - Seção do menu na faixa → é a ativa; seção fora do menu → vale a do menu que vem antes dela
 *   no documento (ordem do DOM, sem medir nada).
 * - Faixa sobre um divisor → um único teste de ponto na linha de leitura.
 *   Nada de getBoundingClientRect nas seções (forçaria o layout das que estão fora da tela,
 *   inclusive as puladas por `content-visibility`).
 * - Seções `neutral` (fora do menu, ex.: #impacto) apagam o LED enquanto estão na faixa.
 * - No fim da página ativa o último item (checado só enquanto o <footer> está visível).
 * Também informa quais âncoras não existem na página (o menu oculta esses itens).
 */
export function useActiveSection(ids: readonly string[], neutral: readonly string[] = []) {
  const key = ids.join("|");
  const neutralKey = neutral.join("|");
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const [missing, setMissing] = useState<string[]>([]);
  /** Incrementado quando uma seção que faltava aparece (ex.: carregada sob demanda) → refaz a vigilância. */
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const list = key.split("|");
    const neutralIds = new Set(neutralKey ? neutralKey.split("|") : []);
    const byId = (id: string) => document.getElementById(id);
    const navEls = list.map(byId).filter((el): el is HTMLElement => el !== null);
    const found = new Set(navEls.map((el) => el.id));
    const absent = list.filter((id) => !found.has(id));
    // atualização adiada: evita render em cascata dentro do efeito
    const raf = requestAnimationFrame(() =>
      setMissing((prev) => (prev.join("|") === absent.join("|") ? prev : absent)),
    );
    // Âncora ausente agora pode ser montada depois: procura de novo quando ela aparecer.
    const mo = absent.length
      ? new MutationObserver(() => {
          if (!absent.some((id) => document.getElementById(id))) return;
          mo?.disconnect();
          setScan((n) => n + 1);
        })
      : null;
    mo?.observe(document.body, { childList: true, subtree: true });
    if (!navEls.length) {
      return () => {
        cancelAnimationFrame(raf);
        mo?.disconnect();
      };
    }

    const neutralEls = [...neutralIds].map(byId).filter((el): el is HTMLElement => el !== null);
    const els = [...navEls, ...neutralEls].sort(byDocumentOrder);
    const lastNav = navEls.slice().sort(byDocumentOrder)[navEls.length - 1];

    // Também vigia as seções fora do menu: um salto (âncora, restauração da rolagem) entre duas
    // delas precisa disparar o observer. Elas contam como a seção do menu que vem antes.
    const tracked = new Set<Element>([...els, ...document.querySelectorAll("main section[id]")]);
    const inBand = new Set<Element>();
    let current = -1; // índice em `els` da seção ativa
    let atEnd = false;

    /** Índice da última seção do menu/neutra que é `node` ou começa antes dele no documento. */
    const indexAt = (node: Node) => {
      let index = -1;
      els.forEach((el, i) => {
        if (el === node || el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) index = i;
      });
      return index;
    };

    const commit = () => {
      if (atEnd) {
        setActive(lastNav.id);
        return;
      }
      const el = els[current];
      if (el) setActive(neutralIds.has(el.id) ? "" : el.id);
    };

    /** Faixa sobre um divisor (nenhuma seção nela): decide pelo elemento na linha de leitura. */
    const resolveFromPoint = () => {
      const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * (LINE + 0.005));
      const index = hit ? indexAt(hit) : -1;
      if (index >= 0) current = index;
    };

    const top = Math.round(LINE * 100);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        }
        if (inBand.size) current = Math.max(...Array.from(inBand, indexAt));
        else resolveFromPoint();
        commit();
      },
      { rootMargin: `-${top}% 0px -${99 - top}% 0px` },
    );
    tracked.forEach((el) => io.observe(el));

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
      mo?.disconnect();
      io.disconnect();
      endIo?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key, neutralKey, scan]);

  return { active, missing };
}

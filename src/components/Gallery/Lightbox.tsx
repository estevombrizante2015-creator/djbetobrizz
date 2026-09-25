"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  type DragControls,
  type MotionValue,
  type PanInfo,
  type Variants,
} from "motion/react";
import type { Photo } from "@/data/types";
import { cn, getImageMeta } from "@/lib/utils";
import { ease } from "@/lib/animations";
import { useExperience } from "@/components/Effects/ExperienceContext";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ZoomInIcon, ZoomOutIcon } from "@/components/ui/Icons";

const ZOOM = 2;
const DOUBLE_TAP_MS = 320;
const panTransition = { duration: 0.4, ease: ease.out };

const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Size = { w: number; h: number };
type Range = { x: number; y: number };

/** Tamanho da foto encaixada (object-contain) na área disponível. */
function fitSize(src: string, box: Size): Size {
  const { width, height } = getImageMeta(src);
  const aspect = width / height;
  const w = Math.min(box.w, box.h * aspect);
  return { w, h: w / aspect };
}

/** Quanto dá para arrastar a foto ampliada sem mostrar o fundo. */
function panRange(fit: Size, box: Size): Range {
  return { x: Math.max(0, (fit.w * ZOOM - box.w) / 2), y: Math.max(0, (fit.h * ZOOM - box.h) / 2) };
}

const slide: Variants = {
  enter: (dir: number) => ({ x: dir === 0 ? 0 : `${dir * 40}%`, opacity: 0, scale: dir === 0 ? 0.94 : 1 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir === 0 ? 0 : `${dir * -40}%`, opacity: 0, scale: dir === 0 ? 0.94 : 1 }),
};

type Props = {
  photos: readonly Photo[];
  startIndex: number;
  onClose: () => void;
  /** Elemento que recebe o foco de volta ao fechar (o frame que abriu). Padrão: o foco ativo ao abrir. */
  returnFocus?: RefObject<HTMLElement | null>;
};

/**
 * Lightbox da galeria: próxima/anterior, zoom ×2 com pan, teclado (← → Esc),
 * swipe no celular (e arrastar para baixo fecha), duplo toque para zoom,
 * foco preso no diálogo e devolvido ao frame de origem, scroll da página travado.
 */
export function Lightbox({ photos, startIndex, onClose, returnFocus }: Props) {
  const count = photos.length;
  const [[index, dir], setView] = useState<[number, number]>([clamp(startIndex, 0, count - 1), 0]);
  const [zoomed, setZoomed] = useState(false);
  const [box, setBox] = useState<Size>({ w: 0, h: 0 });
  const { isDesktop } = useExperience();

  const dialogRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTapRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const draggedRef = useRef(false);
  const closingRef = useRef(false);

  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const panControls = useDragControls();

  const photo = photos[index];
  const fit = fitSize(photo.src, box);
  const range = panRange(fit, box);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  }, [onClose]);

  const go = useCallback(
    (step: number) => {
      if (count < 2 || closingRef.current) return;
      setZoomed(false);
      panX.set(0);
      panY.set(0);
      setView(([i]) => [(i + step + count) % count, step]);
    },
    [count, panX, panY],
  );

  /** Liga/desliga o zoom. `rx/ry` = ponto relativo (0–1) na área da foto. */
  const setZoom = useCallback(
    (next: boolean, point?: { rx: number; ry: number; anchor: boolean }) => {
      setZoomed(next);
      let tx = 0;
      let ty = 0;
      if (next && point) {
        // anchor (toque): o ponto tocado fica sob o dedo · follow (mouse): mapeia a posição do cursor
        const fx = point.anchor ? box.w * (ZOOM - 1) : 2 * range.x;
        const fy = point.anchor ? box.h * (ZOOM - 1) : 2 * range.y;
        tx = clamp((0.5 - point.rx) * fx, -range.x, range.x);
        ty = clamp((0.5 - point.ry) * fy, -range.y, range.y);
      }
      animate(panX, tx, panTransition);
      animate(panY, ty, panTransition);
    },
    [box.w, box.h, range.x, range.y, panX, panY],
  );

  // Trava o scroll, isola o resto da página (inert), foca o diálogo e devolve o foco ao fechar.
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const html = document.documentElement;
    const body = document.body;
    const prevOverflow = html.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const inerted = Array.from(body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(root) && !el.inert,
    );
    inerted.forEach((el) => {
      el.inert = true;
    });

    const active = document.activeElement;
    const opener = returnFocus?.current ?? (active instanceof HTMLElement && active !== body ? active : null);
    root.focus({ preventScroll: true });

    return () => {
      html.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      inerted.forEach((el) => {
        el.inert = false;
      });
      opener?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  // Teclado: ← → navegam, Esc fecha, Tab fica preso no diálogo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        trapFocus(e, dialogRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, requestClose]);

  // Mede a área da foto (o ResizeObserver dispara uma vez ao observar).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const relative = (e: ReactPointerEvent) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return { rx: 0.5, ry: 0.5 };
    return { rx: (e.clientX - r.left) / r.width, ry: (e.clientY - r.top) / r.height };
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    draggedRef.current = false;
    // Zoom: arrastar para mover (toque, ou mouse fora do desktop "cheio").
    if (zoomed && (e.pointerType !== "mouse" || !isDesktop)) panControls.start(e);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    // Desktop: com zoom, a foto acompanha o cursor.
    if (!zoomed || e.pointerType !== "mouse" || !isDesktop) return;
    const { rx, ry } = relative(e);
    panX.set(clamp((0.5 - rx) * 2 * range.x, -range.x, range.x));
    panY.set(clamp((0.5 - ry) * 2 * range.y, -range.y, range.y));
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const down = downRef.current;
    downRef.current = null;
    if (!down || draggedRef.current) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || e.timeStamp - down.t > 450) return;

    const onImage = zoomed || (e.target instanceof Element && e.target.closest("[data-lightbox-photo]") !== null);
    const point = relative(e);

    if (e.pointerType === "mouse") {
      if (!onImage) requestClose();
      else setZoom(!zoomed, { ...point, anchor: false });
      return;
    }

    // Toque: duplo toque = zoom; toque fora da foto fecha.
    const last = lastTapRef.current;
    if (last && e.timeStamp - last.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 32) {
      lastTapRef.current = null;
      setZoom(!zoomed, { ...point, anchor: true });
    } else {
      lastTapRef.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      if (!onImage) requestClose();
    }
  };

  const onSwipeEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (Math.abs(offset.x) >= Math.abs(offset.y)) {
      const power = Math.abs(offset.x) * Math.abs(velocity.x);
      if (offset.x < -70 || (offset.x < -12 && power > 9000)) go(1);
      else if (offset.x > 70 || (offset.x > 12 && power > 9000)) go(-1);
    } else if (offset.y > 110 || (offset.y > 24 && velocity.y > 900)) {
      requestClose();
    }
  };

  const neighbors = count > 1 ? [...new Set([(index + 1) % count, (index - 1 + count) % count])].filter((i) => i !== index) : [];

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: ease.out }}
      className="fixed inset-0 z-[90] flex flex-col overscroll-contain bg-void text-white outline-none"
    >
      {/* Atmosfera: brilho neon + scanlines (decorativo) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(138_43_226/0.22),transparent)]" />
        <div className="absolute -bottom-1/3 left-1/2 h-[60vh] w-[110vw] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(0_229_255/0.1),transparent)]" />
        <div className="scanlines absolute! inset-0" />
      </div>

      {/* ===== Barra superior ===== */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span aria-hidden className="vhs text-2xl leading-none text-white tabular-nums sm:text-3xl">
            {pad2(index + 1)} <span className="text-white/40">/</span> {pad2(count)}
          </span>
          <span aria-hidden className="hud hidden items-center gap-2 text-[0.65rem] text-mute sm:flex">
            <span className="h-px w-6 bg-red shadow-neon-red" />
            Digital contact sheet
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ControlButton
            label={zoomed ? "Reduzir zoom" : "Ampliar foto"}
            pressed={zoomed}
            onClick={() => setZoom(!zoomed)}
          >
            {zoomed ? <ZoomOutIcon size={22} /> : <ZoomInIcon size={22} />}
          </ControlButton>
          <ControlButton label="Fechar galeria" onClick={requestClose} tone="red">
            <CloseIcon size={22} />
          </ControlButton>
        </div>
      </div>

      {/* ===== Palco ===== */}
      <motion.div
        initial={{ scaleY: 0.04, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0.04, opacity: 0 }}
        transition={{ duration: 0.38, ease: ease.out }}
        // clique na margem do palco (fora da área da foto) também fecha
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            downRef.current = null;
          }}
          className={cn(
            "absolute inset-x-2 inset-y-3 touch-none select-none sm:inset-x-24 sm:inset-y-5 lg:inset-x-32",
            zoomed && (isDesktop ? "cursor-zoom-out" : "cursor-grab active:cursor-grabbing"),
          )}
        >
          <AnimatePresence initial={false} custom={dir}>
            <Slide
              key={index}
              photo={photo}
              box={box}
              dir={dir}
              zoomed={zoomed}
              panX={panX}
              panY={panY}
              panControls={panControls}
              onDragStart={() => {
                draggedRef.current = true;
              }}
              onSwipeEnd={onSwipeEnd}
            />
          </AnimatePresence>
        </div>

        {/* Anterior / próxima nas laterais (tablet e desktop) */}
        {count > 1 ? (
          <>
            <ControlButton
              label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 sm:grid lg:left-6 lg:size-14"
            >
              <ChevronLeftIcon size={26} />
            </ControlButton>
            <ControlButton
              label="Próxima foto"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 sm:grid lg:right-6 lg:size-14"
            >
              <ChevronRightIcon size={26} />
            </ControlButton>
          </>
        ) : null}
      </motion.div>

      {/* ===== Barra inferior: legenda, contador, dicas ===== */}
      <div className="relative z-10 px-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
        <div className="flex items-center gap-3 sm:items-end">
          {count > 1 ? (
            <ControlButton label="Foto anterior" onClick={() => go(-1)} className="sm:hidden">
              <ChevronLeftIcon size={24} />
            </ControlButton>
          ) : null}

          <div className="min-w-0 flex-1 text-center sm:text-left">
            {photo.caption ? (
              <p className="hud text-[0.7rem] text-cyan sm:text-xs">
                <span aria-hidden className="font-vhs text-sm tracking-normal text-red">
                  {pad2(index + 1)}A ▸{" "}
                </span>
                {photo.caption}
              </p>
            ) : null}
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/85">{photo.alt}</p>
          </div>

          {count > 1 ? (
            <ControlButton label="Próxima foto" onClick={() => go(1)} className="sm:hidden">
              <ChevronRightIcon size={24} />
            </ControlButton>
          ) : null}

          {count > 1 && count <= 30 ? (
            <div aria-hidden className="hidden shrink-0 items-center gap-1 pb-1 sm:flex">
              {photos.map((p, i) => (
                <span
                  key={`${p.src}-${i}`}
                  className={cn(
                    "h-1 w-3 rounded-full transition-colors duration-300 lg:w-4",
                    i === index ? "bg-cyan shadow-neon-cyan" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <p aria-hidden className="hud mt-3 hidden text-center text-[0.6rem] tracking-[0.2em] text-white/45 sm:text-left [@media(hover:hover)]:block">
          Clique para ampliar · ← → navegar · Esc fechar
        </p>
        <p aria-hidden className="hud mt-3 text-center text-[0.6rem] tracking-[0.14em] text-white/45 [@media(hover:hover)]:hidden">
          Toque 2× para ampliar · deslize para navegar
        </p>
      </div>

      {/* Leitor de tela: anuncia a foto atual */}
      <p className="sr-only" aria-live="polite">
        {`Foto ${index + 1} de ${count}${photo.caption ? ` — ${photo.caption}` : ""}: ${photo.alt}`}
      </p>

      {/* Pré-carrega as vizinhas (mesmo sizes/quality → mesma URL da foto grande) */}
      <div aria-hidden className="pointer-events-none absolute size-px overflow-hidden opacity-0">
        {neighbors.map((i) => (
          <div key={photos[i].src} className="relative size-px">
            <Image src={photos[i].src} alt="" fill sizes="100vw" quality={85} loading="eager" />
          </div>
        ))}
      </div>
    </motion.div>,
    document.body,
  );
}

type SlideProps = {
  photo: Photo;
  box: Size;
  dir: number;
  zoomed: boolean;
  panX: MotionValue<number>;
  panY: MotionValue<number>;
  panControls: DragControls;
  onDragStart: () => void;
  onSwipeEnd: (event: unknown, info: PanInfo) => void;
};

/** Uma foto no palco: swipe (sem zoom) → pan (com zoom) → escala. */
function Slide({ photo, box, dir, zoomed, panX, panY, panControls, onDragStart, onSwipeEnd }: SlideProps) {
  const meta = getImageMeta(photo.src);
  const fit = fitSize(photo.src, box);
  const range = panRange(fit, box);

  return (
    <motion.div
      custom={dir}
      variants={slide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.22 }, scale: { duration: 0.3 } }}
      drag={!zoomed}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={onDragStart}
      onDragEnd={onSwipeEnd}
      className="absolute inset-0"
    >
      <motion.div
        style={{ x: panX, y: panY }}
        drag={zoomed}
        dragListener={false}
        dragControls={panControls}
        dragConstraints={{ left: -range.x, right: range.x, top: -range.y, bottom: range.y }}
        dragElastic={0.06}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ scale: zoomed ? ZOOM : 1 }}
          transition={{ duration: 0.4, ease: ease.out }}
          className="absolute inset-0 grid place-items-center"
        >
          <div
            data-lightbox-photo
            className={cn("relative shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]", !zoomed && "cursor-zoom-in")}
            style={{ width: fit.w, height: fit.h }}
          >
            {fit.w > 0 ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                quality={85}
                loading="eager"
                draggable={false}
                {...(meta.blurDataURL ? { placeholder: "blur" as const, blurDataURL: meta.blurDataURL } : {})}
                style={{ objectFit: "contain" }}
                className="pointer-events-none select-none"
              />
            ) : null}
            {/* Moldura fina neon */}
            <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-white/15" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

type ControlProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
  tone?: "cyan" | "red";
};

/** Botão circular neon (≥ 48px de área de toque). */
function ControlButton({ label, onClick, children, className, pressed, tone = "cyan" }: ControlProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full border border-white/25 bg-void/60 text-white backdrop-blur-md",
        "transition-[color,border-color,box-shadow,background-color] duration-300",
        tone === "cyan"
          ? "hover:border-cyan hover:text-cyan hover:shadow-neon-cyan focus-visible:border-cyan"
          : "hover:border-red hover:text-red hover:shadow-neon-red focus-visible:border-red",
        pressed && "border-cyan text-cyan",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Mantém o Tab dentro do diálogo. */
function trapFocus(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const items = Array.from(
    root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.getClientRects().length > 0);
  if (!items.length) {
    e.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (!root.contains(active)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

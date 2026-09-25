/**
 * Decisão do nível de efeitos — compartilhada entre o layout (script inline executado antes
 * da pintura) e o ExperienceContext (cliente). Ver ExperienceContext.tsx.
 *
 * - "full":     desktop com mouse, tela ≥1024px, ≥4 núcleos e ≥4 GB → experiência completa.
 * - "balanced": celulares, tablets e PCs comuns → animações baratas (CSS transform/opacity,
 *               equalizadores, brilhos, entradas), sem efeitos caros (blend, blur, scroll-linked).
 * - "lite":     aparelhos realmente fracos (≤2 núcleos ou ≤2 GB), economia de dados, rede 2G
 *               ou movimento reduzido → visual estático.
 *
 * Teste manual: adicione ?perf=lite | ?perf=balanced | ?perf=full à URL.
 */
export const PERF_KEY = "bb-perf-v2";
export const DESKTOP_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

/**
 * Script inline (executa antes da pintura) que decide o nível e grava data-perf no <html>.
 * Também marca `data-hash-jump` quando a página abre com #âncora: o salto inicial do navegador fica
 * instantâneo (sem animação calculada com as seções adiadas ainda no tamanho provisório) até o
 * AnchorNavigation corrigir a posição — ver src/components/ui/AnchorNavigation.tsx.
 */
export const PERF_TIER_SCRIPT = `(function(){var d=document.documentElement;try{if(location.hash.length>1)d.setAttribute("data-hash-jump","")}catch(e){}try{var q=location.search.match(/[?&]perf=(lite|balanced|full)/),s=null,t;try{s=sessionStorage.getItem("${PERF_KEY}")}catch(e){}if(q)t=q[1];else if(s==="lite"||s==="balanced"||s==="full")t=s;else{var n=navigator,c=n.connection||{},mm=function(x){return window.matchMedia(x).matches},cores=n.hardwareConcurrency||8,mem=n.deviceMemory||8;if(mm("(prefers-reduced-motion: reduce)")||c.saveData===true||/(^|-)2g$/.test(c.effectiveType||"")||cores<=2||mem<=2)t="lite";else if(mm("${DESKTOP_QUERY}")&&cores>=4&&mem>=4)t="full";else t="balanced"}d.setAttribute("data-perf",t)}catch(e){d.setAttribute("data-perf","balanced")}})();`;

import { Loader } from "@/components/Loader/Loader";
import { Cursor } from "@/components/Cursor/Cursor";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { About } from "@/components/About/About";
import { DjVj } from "@/components/DjVj/DjVj";
import { TheExperience } from "@/components/Experience/TheExperience";
import { MusicStyles } from "@/components/MusicStyles/MusicStyles";
import { Flashback } from "@/components/Flashback/Flashback";
import { Events } from "@/components/Events/Events";
import { EventTypes } from "@/components/EventTypes/EventTypes";
import { Gallery } from "@/components/Gallery/Gallery";
import { Videos } from "@/components/Videos/Videos";
import { Sets } from "@/components/Sets/Sets";
import { Impact } from "@/components/Impact/Impact";
import { CTA } from "@/components/CTA/CTA";
import { Footer } from "@/components/Footer/Footer";
import { SocialLinks } from "@/components/SocialLinks/SocialLinks";
import { WhatsAppButton } from "@/components/WhatsAppButton/WhatsAppButton";
import { SectionDivider } from "@/components/Visualizer/SectionDivider";
import { MusicPlayer } from "@/components/MusicPlayer/MusicPlayer";

/**
 * Envolve uma seção abaixo da dobra com content-visibility:auto — o navegador só renderiza
 * quando ela se aproxima da tela. Não usar em seções com trilhas sticky/scroll-linked
 * (Flashback, Impact, DjVj, CTA) nem acima da dobra (Hero).
 */
function Deferred({ children }: { children: React.ReactNode }) {
  return <div className="cv-auto">{children}</div>;
}

/**
 * One page — a ordem segue a jornada do visitante:
 * entrei → vi o DJ → vi a energia → vi os vídeos → ouvi os sets → entendi → quero contratar → WhatsApp.
 */
export default function Home() {
  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <main id="conteudo">
        <Hero />
        <About />
        <DjVj />
        <Deferred>
          <TheExperience />
        </Deferred>
        <SectionDivider palette="red" />
        <Deferred>
          <MusicStyles />
        </Deferred>
        <Flashback />
        <Deferred>
          <Events />
        </Deferred>
        <Deferred>
          <EventTypes />
        </Deferred>
        <Deferred>
          <Gallery />
        </Deferred>
        <SectionDivider />
        <Deferred>
          <Videos />
        </Deferred>
        <Deferred>
          <Sets />
        </Deferred>
        <Impact />
        <CTA />
      </main>
      <Deferred>
        <Footer />
      </Deferred>
      <SocialLinks />
      <MusicPlayer />
      <WhatsAppButton />
    </>
  );
}

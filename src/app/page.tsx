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
        <TheExperience />
        <SectionDivider palette="red" />
        <MusicStyles />
        <Flashback />
        <Events />
        <EventTypes />
        <Gallery />
        <SectionDivider />
        <Videos />
        <Sets />
        <Impact />
        <CTA />
      </main>
      <Footer />
      <SocialLinks />
      <WhatsAppButton />
    </>
  );
}

import { Deck, type DeckSlideDef } from "@/components/deck/deck";
import { Slide01Hero } from "@/components/deck/slides/01-hero";
import { Slide02Pain } from "@/components/deck/slides/02-pain";
import { Slide03WhyNow } from "@/components/deck/slides/03-why-now";
import { Slide04Interviews } from "@/components/deck/slides/04-interviews";
import { Slide05Reveal } from "@/components/deck/slides/05-reveal";
import { Slide06Generator } from "@/components/deck/slides/06-generator";
import { Slide07CandidateCard } from "@/components/deck/slides/07-candidate-card";
import { Slide08Trap } from "@/components/deck/slides/08-trap";
import { Slide09TwoAudiences } from "@/components/deck/slides/09-two-audiences";
import { Slide10Market } from "@/components/deck/slides/10-market";
import { Slide11Monetization } from "@/components/deck/slides/11-monetization";
import { Slide12Competitors } from "@/components/deck/slides/12-competitors";
import { Slide13Finale } from "@/components/deck/slides/13-finale";

// Deck manifest — order is the pitch order (ru_pitch_v2.md slides 1–13).
const SLIDES: DeckSlideDef[] = [
  { id: "01-hero", title: "Титул" },
  { id: "02-pain", title: "Боль: рынок обвалился" },
  { id: "03-why-now", title: "Почему сейчас" },
  { id: "04-interviews", title: "Глубинные интервью" },
  { id: "05-reveal", title: "Раскрытие", hideChrome: true },
  { id: "06-generator", title: "Как это работает" },
  { id: "07-candidate-card", title: "Карточка кандидата" },
  { id: "08-trap", title: "Ловушка на работу с данными" },
  { id: "09-two-audiences", title: "Две аудитории" },
  { id: "10-market", title: "Рынок" },
  { id: "11-monetization", title: "Монетизация" },
  { id: "12-competitors", title: "Конкуренты" },
  { id: "13-finale", title: "Дорожная карта и финал" },
];

export default function HomePage() {
  return (
    <main id="main" className="relative">
      <Deck slides={SLIDES}>
        <Slide01Hero />
        <Slide02Pain />
        <Slide03WhyNow />
        <Slide04Interviews />
        <Slide05Reveal />
        <Slide06Generator />
        <Slide07CandidateCard />
        <Slide08Trap />
        <Slide09TwoAudiences />
        <Slide10Market />
        <Slide11Monetization />
        <Slide12Competitors />
        <Slide13Finale />
      </Deck>
    </main>
  );
}

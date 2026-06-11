import { Deck, type DeckSlideDef } from "@/components/deck/deck";
import { StubA, StubB, StubC } from "@/components/deck/slides/stubs";

// P1 verification manifest — replaced by the 13-slide manifest in P2.
const SLIDES: DeckSlideDef[] = [
  { id: "stub-a", title: "Стаб A — обычный слайд" },
  { id: "stub-b", title: "Стаб B — слайд со встроенным шагом" },
  { id: "stub-c", title: "Стаб C — SplitText на кириллице" },
];

export default function HomePage() {
  return (
    <main id="main" className="relative">
      <Deck slides={SLIDES}>
        <StubA />
        <StubB />
        <StubC />
      </Deck>
    </main>
  );
}

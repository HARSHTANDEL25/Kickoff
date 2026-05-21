import FixturesSection from "./components/sections/FixturesSection";
import Hero from "./components/sections/Hero";
import NewsSection from "./components/sections/NewsSection";
import StandingsSection from "./components/sections/StandingsSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <FixturesSection />
      <StandingsSection />
      <NewsSection />
    </div>
  );
}

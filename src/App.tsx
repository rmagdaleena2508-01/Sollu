import { useRevealAll, useLang } from './hooks';
import { IconSprite } from './components/Icon';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { WhatItDoes } from './components/WhatItDoes';
import { Faq, Features, Roadmap, Trust } from './components/Sections';
import { Personas } from './components/Personas';
import { SampleFan } from './components/SampleFan';
import { FinalCta, Footer } from './components/Footer';

export function App() {
  const [lang, setLang] = useLang();
  useRevealAll();

  return (
    <>
      <IconSprite />
      <Nav lang={lang} onLang={setLang} />
      <main id="top" className="landing">
        <Hero lang={lang} />
        <WhatItDoes />
        <Features />
        <Trust />
        <Personas />
        <SampleFan />
        <Roadmap />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

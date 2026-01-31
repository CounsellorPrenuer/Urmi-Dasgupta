import { Navbar } from '@/components/Navbar';
import { CursorTrail } from '@/components/CursorTrail';
import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { WhoWeHelp } from '@/components/sections/WhoWeHelp';
import { ChangingLandscape } from '@/components/sections/ChangingLandscape';
import { Methodology } from '@/components/sections/Methodology';
import { Services } from '@/components/sections/Services';
import { Founder } from '@/components/sections/Founder';
import { Packages } from '@/components/sections/Packages';
import { MentoriaPackages } from '@/components/sections/MentoriaPackages';
import { Blog } from '@/components/sections/Blog';
import { HealingTestimonials } from '@/components/sections/HealingTestimonials';
import { CareerTestimonials } from '@/components/sections/CareerTestimonials';
import { Mentoria } from '@/components/sections/Mentoria';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CursorTrail />
      <Hero />
      <Stats />
      <WhoWeHelp />
      <ChangingLandscape />
      <Methodology />
      <Services />
      <Founder />
      <Packages />
      <MentoriaPackages />
      <HealingTestimonials />
      <CareerTestimonials />
      <Blog />
      <Mentoria />
      <Contact />
      <Footer />
    </div>
  );
}

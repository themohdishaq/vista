// filepath: app/page.tsx
import React from 'react';
import HeroSection from '@/components/public/home/HeroSection';
import FeaturesSection from '@/components/public/home/FeaturesSection';
import HowItWorksSection from '@/components/public/home/HowItWorksSection';
import TeamRolesSection from '@/components/public/home/TeamRolesSection';
import CtaBannerSection from '@/components/public/home/CtaBannerSection';


export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col bg-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TeamRolesSection />
      <CtaBannerSection />
    </main>
  );
}

// filepath: app/about/page.tsx
import React from 'react';
import { AboutHeroSection } from '@/components/public/about/AboutHeroSection';
import { AboutMissionVision } from '@/components/public/about/AboutMissionVision';
import { AboutPillarsSection } from '@/components/public/about/AboutPillarsSection';
import { AboutRolesSection } from '@/components/public/about/AboutRolesSection';
import { AboutMilestonesSection } from '@/components/public/about/AboutMilestonesSection';
import { AboutComplianceBanner } from '@/components/public/about/AboutComplianceBanner';
import { AboutCtaSection } from '@/components/public/about/AboutCtaSection';

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full flex flex-col bg-white">
      <AboutHeroSection />
      <AboutMissionVision />
      <AboutPillarsSection />
      <AboutRolesSection />
      <AboutMilestonesSection />
      <AboutComplianceBanner />
      <AboutCtaSection />
    </main>
  );
}

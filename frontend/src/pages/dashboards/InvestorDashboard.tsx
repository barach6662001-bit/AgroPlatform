import { HeroSection } from '@/components/dashboard/investor/HeroSection';
import { SecondaryStats } from '@/components/dashboard/investor/SecondaryStats';
import { MarginalityBreakdown } from '@/components/dashboard/investor/MarginalityBreakdown';
import {
  FieldMapPlaceholder,
  ActivityFeedPlaceholder,
  FinanceSectionPlaceholder,
} from '@/components/dashboard/investor/placeholders';

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-default -z-10">
        <div className="noise-overlay" />
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <FieldMapPlaceholder />
          </div>
          <ActivityFeedPlaceholder />
        </div>

        <SecondaryStats />

        <FinanceSectionPlaceholder />

        <MarginalityBreakdown />
      </div>
    </div>
  );
}

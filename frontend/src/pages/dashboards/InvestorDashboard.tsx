import { HeroSection } from '@/components/dashboard/investor/HeroSection';
import { FieldMap } from '@/components/dashboard/investor/FieldMap';
import { ActivityFeed } from '@/components/dashboard/investor/ActivityFeed';
import { SecondaryStats } from '@/components/dashboard/investor/SecondaryStats';
import { MarginalityBreakdown } from '@/components/dashboard/investor/MarginalityBreakdown';
import { FinanceSectionPlaceholder } from '@/components/dashboard/investor/placeholders';

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
            <FieldMap />
          </div>
          <ActivityFeed />
        </div>

        <SecondaryStats />

        <FinanceSectionPlaceholder />

        <MarginalityBreakdown />
      </div>
    </div>
  );
}

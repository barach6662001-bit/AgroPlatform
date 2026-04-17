import { HeroSection } from '@/components/dashboard/investor/HeroSection';

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <HeroSection />
        {/* task-03 adds map, activity feed, finance section */}
      </div>
    </div>
  );
}

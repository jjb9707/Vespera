import AudienceCards from "@/components/sections/AudienceCards";
import StepsCard from "@/components/sections/StepsCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {/* Placeholder Hero Section - keeping existing style simplified or just adding below */}
        <AudienceCards />
        <StepsCard />
      </main>
    </div>
  );
}

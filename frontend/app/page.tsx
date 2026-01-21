import AudienceCards from "@/components/sections/AudienceCards";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1">
        {/* Placeholder Hero Section - keeping existing style simplified or just adding below */}
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              Platform for Everyone
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Connecting tenants, landlords, and agents in one seamless ecosystem.
            </p>
        </div>

        <AudienceCards />
      </main>
    </div>
  );
}

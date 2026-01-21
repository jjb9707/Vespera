import React from 'react';

const audiences = [
  {
    role: "Tenants",
    title: "For Tenants",
    description: "Find your dream home with ease. Browse verified listings, schedule viewings, and submit applications online.",
    cta: "Browse Listings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )
  },
  {
    role: "Landlords",
    title: "For Landlords",
    description: "Manage your properties efficiently. Find reliable tenants, track payments, and handle maintenance requests.",
    cta: "List Property",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    )
  },
  {
    role: "Agents",
    title: "For Agents",
    description: "Connect with clients and grow your business. access tools for lead generation and portfolio management.",
    cta: "Join Network",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    )
  }
];

export default function AudienceCards() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience) => (
            <div 
              key={audience.role}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-zinc-800 flex flex-col items-start"
            >
              <div className="mb-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform duration-300">
                {audience.icon}
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                {audience.title}
              </h3>
              
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                {audience.description}
              </p>
              
              <a 
                href="#" 
                className="mt-auto inline-flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:underline decoration-2 underline-offset-4"
              >
                {audience.cta}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

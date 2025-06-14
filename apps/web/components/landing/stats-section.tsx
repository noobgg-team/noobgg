'use client';

export default function StatsSection() {
  const stats = [
    { number: "10K+", label: "Active Gamers" },
    { number: "50K+", label: "Lobbies Created" },
    { number: "500K+", label: "Matches Played" },
    { number: "24/7", label: "Community Support" }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the Community
          </h2>
          <p className="text-xl text-gray-300">
            Thousands of gamers are already finding their perfect teammates
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
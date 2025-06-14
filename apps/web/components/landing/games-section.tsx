'use client';

import Image from "next/image";

export default function GamesSection() {
  const games = [
    { name: 'Fortnite', icon: '/games/fortnite.svg', color: 'from-blue-500 to-purple-600' },
    { name: 'CS2', icon: '/games/cs2.svg', color: 'from-orange-500 to-red-600' },
    { name: 'League of Legends', icon: '/games/lol.svg', color: 'from-blue-600 to-cyan-500' },
    { name: 'Valorant', icon: '/games/valorant.svg', color: 'from-red-500 to-pink-600' },
    { name: 'Rainbow Six Siege', icon: '/games/r6.svg', color: 'from-yellow-500 to-orange-600' },
    { name: 'Minecraft', icon: '/games/minecraft.svg', color: 'from-green-500 to-emerald-600' }
  ];
  
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Favorite Games
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find teammates for the most popular multiplayer games
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {games.map((game) => (
            <div key={game.name} className="group cursor-pointer">
              <div className={`bg-gradient-to-br ${game.color} p-6 rounded-xl transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-purple-500/20`}>
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {game.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-white font-semibold text-center text-sm md:text-base">{game.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
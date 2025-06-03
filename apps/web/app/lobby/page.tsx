'use client';
// import React from "react";
import LobbySidebar from "./LobbySidebar";
import LobbyHeader from "./LobbyHeader";
import LobbyPlayerCards from "./LobbyPlayerCards";
import LobbyChatBox from "./LobbyChatBox";
import { useState } from "react";
import { type Player } from './LobbyPlayerCards';

type LobbySetting = 'open-for-all' | 'stats-only';

export default function LobbyPage() {
  const [isStatsOnly, setIsStatsOnly] = useState(false);
  const [applications, setApplications] = useState<Player[]>([
    {
      id: 3,
      name: 'Samuraix',
      rank: 'Gold II',
      kd: 0.95,
      winRate: 48,
      winStreak: 0,
      recentMVP: 0,
      avatar: '/avatar3.png',
      isLeader: false,
      status: 'Applying',
      game: 'Valorant',
      level: 55,
      mainAgent: 'Sage',
      playtime: '15h'
    },
    {
      id: 4,
      name: 'NinjaKiller',
      rank: 'Platinum I',
      kd: 1.15,
      winRate: 52,
      winStreak: 2,
      recentMVP: 1,
      avatar: '/avatar4.png',
      isLeader: false,
      status: 'Applying',
      game: 'Valorant',
      level: 88,
      mainAgent: 'Reyna',
      playtime: '45h'
    }
  ]);

  const handleAccept = (id: number) => {
    // Implement logic to add player to lobby and remove from applications
    console.log('Accepted application from', id);
    setApplications(applications.filter(app => app.id !== id));
  };
  const handleDecline = (id: number) => {
    console.log('Declined application from', id);
    setApplications(applications.filter(app => app.id !== id));
  };

  const handleLobbySettingChange = (setting: LobbySetting) => {
    setIsStatsOnly(setting === 'stats-only');
  };

  return (
    <div className="flex min-h-screen bg-[#10151c] text-gray-100 font-sans">
      {/* Sidebar */}
      <LobbySidebar />
      {/* Ana içerik */}
      <main className="flex-1 p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Header ve filtreler */}
        <section className="mb-4">
          <LobbyHeader onLobbySettingChange={handleLobbySettingChange} />
        </section>
        {/* Oyuncu kartları */}
        <section className="mb-4">
          <LobbyPlayerCards />
        </section>
        {/* Chat kutusu ve Applications */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 flex">
          <div className="lg:col-span-2 flex flex-col flex-1">
            <LobbyChatBox />
          </div>
          <div className="flex flex-col gap-6 h-full flex-1">
            {/* Applications kutusu artık stats only state'e göre gösterilecek */}
            {isStatsOnly ? (
              <div className="bg-card rounded-xl p-4 shadow-lg border border-border flex-1">
                <div className="font-semibold text-foreground mb-4 text-lg">Applications</div>
                {applications.length === 0 ? (
                  <div className="text-secondary text-sm text-center py-8">No applications yet.</div>
                ) : (
                  <ul className="space-y-3">
                    {applications.map(app => (
                      <li key={app.id} className="flex flex-col sm:flex-row items-center justify-between bg-background rounded-lg px-4 py-3 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          {/* Avatar */}
                          <img 
                            src={app.avatar}
                            alt={app.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40/3b82f6/ffffff?text=N'; // Fallback avatar
                            }}
                          />
                          {/* Player Info */}
                          <div className="flex flex-col items-start">
                            <span className="text-foreground font-semibold text-sm">{app.name}</span>
                            <span className="text-secondary text-xs">{app.rank} • Level {app.level}</span>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-secondary mb-2 sm:mb-0">
                           <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">K/D:</span> {app.kd}
                           </div>
                            <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">Win Rate:</span> {app.winRate}%
                           </div>
                            <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">Playtime:</span> {app.playtime}
                           </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 ml-auto">
                          <button onClick={() => handleAccept(app.id)} className="bg-success/20 hover:bg-success/30 text-success px-3 py-1 rounded-md text-xs font-semibold transition">
                            Accept
                          </button>
                          <button onClick={() => handleDecline(app.id)} className="bg-error/20 hover:bg-error/30 text-error px-3 py-1 rounded-md text-xs font-semibold transition">
                            Decline
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-4 shadow-lg border border-border flex-1 opacity-50 flex flex-col items-center justify-center text-center">
                 <div className="font-semibold text-secondary mb-3 text-lg">Applications</div>
                <div className="text-secondary text-sm">Applications are only available in stats only lobbies.</div>
              </div>
            )}
            
          </div>
        </section>
      </main>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import { FaUserPlus, FaCrown, FaMedal, FaTrophy, FaStar, FaGamepad, FaFireAlt, FaUserEdit, FaCommentAlt, FaChartLine } from 'react-icons/fa';

export type Player = {
  id: number;
  name: string;
  rank: string;
  kd: number;
  winRate: number;
  winStreak: number;
  recentMVP: number;
  avatar: string;
  isLeader: boolean;
  status: string;
  game: string;
  level: number;
  mainAgent: string;
  playtime: string;
};

const players: Player[] = [
  {
    id: 1,
    name: 'iShielda',
    rank: 'Diamond III',
    kd: 1.27,
    winRate: 56,
    winStreak: 4,
    recentMVP: 2,
    avatar: '/avatar1.png',
    isLeader: true,
    status: 'Ready',
    game: 'Valorant',
    level: 98,
    mainAgent: 'Jett',
    playtime: '32h'
  },
  {
    id: 2,
    name: 'Xoien',
    rank: 'Platinum III',
    kd: 1.01,
    winRate: 14,
    winStreak: 0,
    recentMVP: 0,
    avatar: '/avatar2.png',
    isLeader: false,
    status: 'AFK',
    game: 'Valorant',
    level: 76,
    mainAgent: 'Sova',
    playtime: '28h'
  },
];

const RankColors: Record<string, string> = {
  'Diamond': 'from-blue-500 to-indigo-800',
  'Platinum': 'from-cyan-400 to-blue-700',
  'Gold': 'from-yellow-400 to-amber-700',
  'Silver': 'from-slate-400 to-slate-600',
  'Bronze': 'from-amber-700 to-amber-900',
  'Iron': 'from-neutral-600 to-neutral-800',
  'Ascendant': 'from-emerald-500 to-emerald-800',
  'Immortal': 'from-rose-600 to-rose-800',
  'Radiant': 'from-yellow-400 to-amber-600',
};

// Define accent colors for each rank
const RankAccentColors: Record<string, string> = {
  'Diamond': 'blue-400',
  'Platinum': 'cyan-400',
  'Gold': 'amber-400',
  'Silver': 'slate-300',
  'Bronze': 'amber-500',
  'Iron': 'gray-400',
  'Ascendant': 'emerald-400',
  'Immortal': 'rose-400',
  'Radiant': 'yellow-300',
};

export default function LobbyPlayerCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Get the appropriate color gradient based on player rank
  const getRankGradient = (rank: string) => {
    const rankBase = rank.split(' ')[0]; // Extract base rank (Diamond, Gold, etc)
    return RankColors[rankBase] || 'from-gray-700 to-gray-900';
  };
  
  // Get the accent color based on player rank
  const getRankAccentColor = (rank: string) => {
    const rankBase = rank.split(' ')[0];
    return RankAccentColors[rankBase] || 'blue-400';
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 xl:gap-6 justify-center mb-6">
      {players.map((player) => {
        const isHovered = hoveredCard === player.id;
        const rankGradient = getRankGradient(player.rank);
        const accentColor = getRankAccentColor(player.rank);
        
        return (
          <div
            key={player.id}
            className="group relative w-full h-full"
            onMouseEnter={() => setHoveredCard(player.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Card glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${rankGradient} opacity-50 blur-lg group-hover:opacity-75 transition-all duration-500 rounded-2xl -z-10`}></div>
            
            {/* Main card */}
            <div className="w-full h-full aspect-[3/4] rounded-2xl overflow-hidden relative bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/90 shadow-xl border border-[#334155]/40 backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-pattern-${player.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-pattern-${player.id})`} />
                </svg>
              </div>
              
              {/* Status indicator with animation */}
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all duration-300 ${player.status === 'Ready' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-green-100' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-100'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${player.status === 'Ready' ? 'bg-green-200 animate-pulse' : 'bg-amber-200'}`}></span>
                <span className="tracking-wide">{player.status}</span>
              </div>
              
              {/* Leader crown with animation */}
              {player.isLeader && (
                <div className="absolute top-3 left-3 bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 rounded-lg shadow-md text-white transform rotate-[-10deg] animate-pulse">
                  <FaCrown className="text-amber-100 drop-shadow" />
                </div>
              )}
              
              {/* Player banner background */}
              <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${rankGradient} opacity-80`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptLTE4IDBjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              </div>
              
              {/* Player content */}
              <div className="flex flex-col items-center h-full px-4 pt-16 pb-4">
                {/* Avatar with border effect */}
                <div className="relative w-20 h-20 mb-3 z-10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse-slow"></div>
                  <div className="absolute inset-[2px] rounded-full overflow-hidden border-2 border-blue-400/30">
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay gradient on avatar */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* MVP badge if applicable */}
                  {player.recentMVP > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-1.5 border-2 border-blue-900 shadow-lg">
                      <FaMedal className="text-white text-xs" />
                    </div>
                  )}
                </div>
                
                {/* Player name with glow effect */}
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg text-white drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300">{player.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-sm text-blue-400">
                    <span className="font-medium">{player.rank}</span>
                    {player.winStreak >= 3 && (
                      <div className="flex items-center gap-0.5 text-amber-300 text-xs">
                        <FaFireAlt className="animate-pulse" />
                        <span>{player.winStreak}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Main Agent */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-white/80 mb-3">
                  <FaGamepad className="text-blue-400" />
                  <span>{player.mainAgent} · {player.playtime}</span>
                </div>
                
                {/* Stats with animated progress bars */}
                <div className="w-full space-y-2.5 group-hover:space-y-3 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-blue-400 font-medium">K/D Ratio</span>
                      <span className="text-xs font-bold text-white">{player.kd}</span>
                    </div>
                    <div className="w-full bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full relative transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(player.kd / 2, 1) * 100}%`,
                          background: `linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 opacity-75 overflow-hidden">
                          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-blue-400 font-medium">Win Rate</span>
                      <span className="text-xs font-bold text-white">{player.winRate}%</span>
                    </div>
                    <div className="w-full bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full relative transition-all duration-1000 ease-out"
                        style={{
                          width: `${player.winRate}%`,
                          background: `linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 opacity-75 overflow-hidden">
                          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Interactive card overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex flex-col justify-end p-5 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex flex-col justify-end space-y-2 translate-y-5 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 hover:gap-2">
                      <FaUserEdit className="text-blue-400" />
                      <span>View Profile</span>
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 hover:gap-2 shadow-md">
                      <FaCommentAlt className="text-blue-300" />
                      <span>Send Message</span>
                    </button>
                    <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 hover:gap-2 shadow-md">
                      <FaChartLine className="text-indigo-300" />
                      <span>View Stats</span>
                    </button>
                  </div>
                </div>
                
                {/* Animated particles */}
                {player.status === 'Ready' && (
                  <div className="absolute -inset-1 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-blue-400 animate-float-slow"></div>
                    <div className="absolute top-1/4 right-1/3 w-1 h-1 rounded-full bg-blue-400 animate-float-slow animation-delay-1000"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-blue-400 animate-float-slow animation-delay-2000"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Empty slots with enhanced animation and interactivity */}
      {Array.from({ length: 5 - players.length }).map((_, idx) => (
        <div key={`empty-${idx}`} className="relative group">
          {/* Pulsing glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-75 blur-xl transition-all duration-500 rounded-2xl animate-pulse-slow"></div>
          
          <div className="relative w-full aspect-[3/4] rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-md border border-blue-500/20 flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-400/40 group-hover:shadow-xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`empty-pattern-${idx}`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#empty-pattern-${idx})`} />
              </svg>
            </div>
            
            <div className="flex flex-col items-center transition-all duration-300 group-hover:scale-105">
              {/* Glowing circle */}
              <div className="relative w-24 h-24 mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-pulse-slow"></div>
                <div className="absolute inset-[3px] rounded-full border-2 border-dashed border-blue-400/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="absolute inset-0 bg-blue-900/20 rounded-full"></div>
                  <FaUserPlus className="relative z-10 text-3xl text-blue-400/70 group-hover:text-blue-400 transition-all duration-300 animate-subtle-bounce" />
                </div>
              </div>
              
              <div className="text-blue-300 font-medium text-center transition-all duration-300 group-hover:text-blue-200">
                <div className="text-base mb-1">Invite Player</div>
                <div className="text-xs text-blue-400/70 group-hover:text-blue-300/80">Click to send invite</div>
              </div>
            </div>
            
            {/* Hover overlay with button */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex flex-col justify-end p-5 pointer-events-none group-hover:pointer-events-auto">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                <FaUserPlus className="text-blue-300" />
                <span>Send Invite</span>
              </button>
            </div>
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl scale-105 opacity-0 group-hover:opacity-100 group-hover:animate-ping-slow transition-opacity duration-300 -z-10"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

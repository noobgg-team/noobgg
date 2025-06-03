'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaGamepad, FaDesktop, FaGlobeEurope, FaLanguage, FaTrophy, 
  FaArrowUp, FaHashtag, FaLink, FaDiscord, FaCopy, FaCheck, 
  FaFilter, FaUsers, FaChevronDown, FaBell, FaLock, FaStar
} from 'react-icons/fa';

const filters = [
  { label: "Valorant", icon: <FaGamepad className="text-primary" /> },
  { label: "PC", icon: <FaDesktop className="text-secondary" /> },
  { label: "EU", icon: <FaGlobeEurope className="text-accent" /> },
  { label: "EN", icon: <FaLanguage className="text-success" /> },
  { label: "Competitive", icon: <FaTrophy className="text-warning" /> },
];

type LobbySetting = 'open-for-all' | 'stats-only';

export default function LobbyHeader({ onStatsOnlyChange, onLobbySettingChange }: { onStatsOnlyChange?: (isStatsOnly: boolean) => void, onLobbySettingChange?: (setting: LobbySetting) => void }) {
  const [isStatsOnly, setIsStatsOnly] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [selectedRank, setSelectedRank] = useState('Diamond+');
  const [lobbySetting, setLobbySetting] = useState<LobbySetting>('open-for-all');
  const [lobbyNotes, setLobbyNotes] = useState('We are 2 friends looking for others to play competitive with 5-man party');
  const rankDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside for rank dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rankDropdownRef.current && !rankDropdownRef.current.contains(event.target as Node)) {
        setShowRankDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStatsOnlyChange = () => {
    const newValue = !isStatsOnly;
    setIsStatsOnly(newValue);
    if (onStatsOnlyChange) {
      onStatsOnlyChange(newValue);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLobbySettingChange = (setting: LobbySetting) => {
    setLobbySetting(setting);
    if (onLobbySettingChange) {
      onLobbySettingChange(setting);
    }
  };
  
  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];
  const [rankRange, setRankRange] = useState<[number, number]>([ranks.indexOf('Gold'), ranks.indexOf('Diamond')]);
  
  // Determine the width of the progress bar based on selected rank
  const getRankProgressWidth = () => {
    const index = ranks.indexOf(selectedRank);
    return `${((index + 1) / ranks.length) * 100}%`;
  };

  // Function to handle rank range change (simplified for now)
  const handleRankRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is a simplified example. A proper range slider component would be better.
    // For now, we'll just update based on a single input value if needed or leave as is.
    console.log('Rank range change:', event.target.value);
  };

  return (
    <div className="relative bg-card border border-border rounded-xl shadow-lg overflow-hidden group">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10%] opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="url(#smallGrid)"/>
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Animated orbs */}
        <div className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl top-10 left-10 animate-pulse-slow"></div>
        <div className="absolute w-32 h-32 rounded-full bg-accent/10 blur-xl bottom-10 right-[20%] animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute w-16 h-16 rounded-full bg-secondary/10 blur-xl top-1/2 right-1/4 animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="relative px-6 py-6 flex flex-col gap-5 z-10">
        {/* Top section: Filters and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1.5 bg-primary/10 backdrop-blur-md rounded-lg border border-primary/20 shadow-inner group-hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center bg-primary/20 rounded-lg p-1.5 mr-2">
                <FaFilter className="text-primary animate-pulse-slow" />
              </div>
              
              <div className="flex gap-1">
                {filters.map((filter, idx) => (
                  <button 
                    key={filter.label} 
                    onClick={() => setSelectedFilter(idx)}
                    className={`relative flex items-center gap-1.5 py-2 px-3.5 rounded-md text-sm font-medium transition-all duration-300 overflow-hidden ${
                      selectedFilter === idx 
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 ring-1 ring-primary/50' 
                        : 'hover:bg-primary/10 text-foreground hover:shadow-md'
                    }`}
                  >
                    {selectedFilter === idx && (
                      <span className="absolute inset-0 overflow-hidden opacity-30">
                        <span className="absolute -inset-[100%] animate-[spin_10s_linear_infinite] opacity-50 blur-md bg-gradient-to-r from-transparent via-white to-transparent"></span>
                      </span>
                    )}
                    
                    <span className={`transition-all duration-300 ${selectedFilter === idx ? 'scale-110 text-white' : ''}`}>
                      {filter.icon}
                    </span>
                    <span className={`transition-all duration-300 ${selectedFilter === idx ? 'font-semibold' : ''}`}>
                      {filter.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              {copied ? <FaCheck className="text-success" /> : <FaCopy />}
              <span className="hidden md:inline">Copy Link</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors">
              <FaDiscord />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Lobby Settings */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="font-semibold text-foreground">Lobby Settings:</div>
          <div className="flex items-center p-1 bg-secondary/10 rounded-lg border border-secondary/20">
            <button 
              onClick={() => handleLobbySettingChange('open-for-all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                lobbySetting === 'open-for-all' 
                  ? 'bg-secondary text-secondary-foreground shadow-sm' 
                  : 'text-secondary-foreground/60 hover:bg-secondary/20'
              }`}
            >
              Open For All
            </button>
            <button 
              onClick={() => handleLobbySettingChange('stats-only')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                lobbySetting === 'stats-only' 
                  ? 'bg-secondary text-secondary-foreground shadow-sm' 
                  : 'text-secondary-foreground/60 hover:bg-secondary/20'
              }`}
            >
              Stats Only
            </button>
          </div>

          {/* Rank Range (Simplified) */}
          <div className="flex items-center gap-2 text-foreground">
            <span className="font-semibold text-sm">Rank Range:</span>
            {/* Placeholder for a more complex range slider */}
            <div className="flex items-center gap-1 text-secondary text-sm">
              <span>{ranks[rankRange[0]]}</span>
              <span>-</span>
              <span>{ranks[rankRange[1]]}</span>
            </div>
            {/* A visual representation of the range could be added here */}
          </div>
        </div>

        {/* Lobby Notes */}
        <div className="w-full">
          <label htmlFor="lobby-notes" className="font-semibold text-foreground block mb-2">Notes:</label>
          <textarea 
            id="lobby-notes"
            value={lobbyNotes}
            onChange={(e) => setLobbyNotes(e.target.value)}
            placeholder="Add notes about your lobby..."
            rows={2}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-foreground"
          />
        </div>

      </div>
    </div>
  );
}
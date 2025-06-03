'use client';

import { useState } from 'react';
import { 
  FaUserCircle, FaUserFriends, FaUsers, FaTrophy, FaPlus, FaCog, 
  FaDiscord, FaSignOutAlt, FaBell, FaChevronLeft, FaGamepad, FaFire
} from 'react-icons/fa';

export default function LobbySidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('players');

  return (
    <aside 
      className={`flex flex-col gap-6 ${collapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#1a2333] to-[#171f2c] p-4 border-r border-[#2a364a] min-h-screen shadow-xl relative transition-all duration-300 z-10`}
    >
      {/* Collapse button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-blue-600 text-white rounded-full p-1 shadow-lg hover:bg-blue-700 transition-colors z-20"
      >
        <FaChevronLeft className={`text-xs transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Gradient border effect */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-blue-500/50"></div>

      {/* Logo & User Profile */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} pt-2`}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0f172a] flex items-center justify-center">
              <img 
                src="/avatar-placeholder.png" 
                alt="User" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/200/4f46e5/ffffff?text=N';
                }}
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
        </div>
        
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-white truncate">NoobGG Player</h3>
            <p className="text-xs text-blue-300">Valorant • Diamond III</p>
          </div>
        )}
      </div>

      {/* Notification Badge */}
      {!collapsed && (
        <div className="flex items-center justify-between bg-[#1e293b]/50 rounded-lg px-3 py-2 border border-[#334155]/40">
          <div className="flex items-center gap-2 text-gray-300">
            <FaBell className="text-blue-400" />
            <span className="text-sm">Notifications</span>
          </div>
          <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">3</div>
        </div>
      )}

      {/* Main Buttons */}
      <div className={`flex ${collapsed ? 'justify-center' : ''}`}>
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] group">
          <FaPlus className={`${collapsed ? 'text-xl' : ''} text-blue-300 group-hover:rotate-90 transition-transform duration-300`} /> 
          {!collapsed && <span>Create Lobby</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <div className={`${!collapsed ? 'pl-2 mb-2' : 'text-center'} text-xs font-semibold text-gray-500 uppercase tracking-wider`}>
          {!collapsed ? 'Navigation' : '•••'}
        </div>
        
        <button 
          onClick={() => setActiveTab('players')}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group
            ${activeTab === 'players'
              ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/5 text-white border border-blue-500/30'
              : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'}`}
        >
          <div className={`relative ${activeTab === 'players' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`}>
            <FaUserFriends className="text-xl" />
            {activeTab === 'players' && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
          </div>
          {!collapsed && <span className="font-medium">Players</span>}
          {!collapsed && activeTab === 'players' && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>}
        </button>
        
        <button 
          onClick={() => setActiveTab('clans')}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group
            ${activeTab === 'clans'
              ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/5 text-white border border-blue-500/30'
              : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'}`}
        >
          <div className={`relative ${activeTab === 'clans' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`}>
            <FaUsers className="text-xl" />
            {activeTab === 'clans' && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
          </div>
          {!collapsed && <span className="font-medium">Clans</span>}
          {!collapsed && activeTab === 'clans' && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>}
        </button>
        
        <button 
          onClick={() => setActiveTab('tournaments')}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group
            ${activeTab === 'tournaments'
              ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/5 text-white border border-blue-500/30'
              : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'}`}
        >
          <div className={`relative ${activeTab === 'tournaments' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`}>
            <FaTrophy className="text-xl" />
            {activeTab === 'tournaments' && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
          </div>
          {!collapsed && <span className="font-medium">Tournaments</span>}
          {!collapsed && activeTab === 'tournaments' && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>}
        </button>
        
        <button 
          onClick={() => setActiveTab('games')}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group
            ${activeTab === 'games'
              ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/5 text-white border border-blue-500/30'
              : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'}`}
        >
          <div className={`relative ${activeTab === 'games' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`}>
            <FaGamepad className="text-xl" />
            {activeTab === 'games' && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
          </div>
          {!collapsed && <span className="font-medium">Games</span>}
          {!collapsed && activeTab === 'games' && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>}
        </button>
      </nav>

      {/* Recent Activity */}
      {!collapsed && (
        <div className="bg-[#1e293b]/50 rounded-lg p-3 border border-[#334155]/40 mb-2">
          <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <FaFire className="text-amber-500" /> Recent Activity
          </h4>
          <div className="text-xs text-gray-300">
            <p className="mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              You won a match in Valorant
            </p>
            <p className="text-gray-400 text-[10px]">15 minutes ago</p>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex flex-col gap-2">
        {!collapsed && (
          <div className={`${!collapsed ? 'pl-2 mb-1' : 'text-center'} text-xs font-semibold text-gray-500 uppercase tracking-wider`}>
            Links
          </div>
        )}
        
        <button className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg text-gray-300 hover:bg-[#1e293b] transition-colors text-base font-medium group`}>
          <FaDiscord className="text-xl text-purple-400 group-hover:text-purple-300" />
          {!collapsed && <span>Discord</span>}
        </button>
        
        <button className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg text-gray-300 hover:bg-[#1e293b] transition-colors text-base font-medium group`}>
          <FaCog className="text-xl text-gray-400 group-hover:text-blue-300 group-hover:rotate-45 transition-transform duration-300" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      <button className={`mt-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-none rounded-lg py-3 ${collapsed ? 'px-0 justify-center' : 'px-4'} font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2`}>
        <FaSignOutAlt className="text-red-300" />
        {!collapsed && <span>Leave Lobby</span>}
      </button>
    </aside>
  );
}
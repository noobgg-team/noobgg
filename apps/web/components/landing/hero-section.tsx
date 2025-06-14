'use client';

import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background with gaming elements */}
      <div className="absolute inset-0 bg-[url('/gaming-pattern.svg')] opacity-10" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              noob<span className="text-purple-400">.gg</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-medium">
              Find Your Gaming Squad
            </p>
          </div>
          
          {/* Value proposition */}
          <div className="mb-8 animate-slide-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Connect. Play. <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">Dominate.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of gamers finding teammates for epic sessions. 
              Create lobbies, chat with players, and build your gaming community.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 rounded-lg">
              Start Playing Now
            </button>
            <button className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-6 text-lg font-semibold transition-all duration-300 bg-transparent backdrop-blur-sm rounded-lg">
              Watch Demo
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>10K+ Active Players</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>6 Popular Games</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>24/7 Community</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-purple-400" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float-delayed"></div>
      </div>
    </section>
  );
} 
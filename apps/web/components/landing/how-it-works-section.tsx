'use client';

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Sign Up & Create Profile",
      description: "Set your nickname, avatar, and favorite games in minutes",
      icon: "✓"
    },
    {
      step: "02", 
      title: "Browse or Create Lobbies",
      description: "Find existing groups or start your own gaming session",
      icon: "🔍"
    },
    {
      step: "03",
      title: "Connect & Chat",
      description: "Coordinate strategies and build friendships before you play",
      icon: "💬"
    },
    {
      step: "04",
      title: "Play & Dominate",
      description: "Jump into your game with a coordinated team ready to win",
      icon: "🏆"
    }
  ];
  
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-300">
            Get started in 4 simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-600 to-transparent z-0" />
              )}
              
              <div className="relative z-10 text-center">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="bg-slate-900 text-purple-400 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                  STEP {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
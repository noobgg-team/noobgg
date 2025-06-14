'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: "👥",
      title: "Instant Matchmaking",
      description: "Join public lobbies instantly or request access to private groups"
    },
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Coordinate with your team through in-lobby and direct messaging"
    },
    {
      icon: "👤",
      title: "Build Your Network",
      description: "Add friends, view profiles, and build lasting gaming relationships"
    },
    {
      icon: "🔍",
      title: "Smart Filters",
      description: "Find players by game, skill level, region, and language preferences"
    }
  ];
  
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose noob.gg?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to find teammates and dominate your favorite games
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300 shadow-lg">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
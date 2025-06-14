'use client';

export default function CTASection() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Find Your Squad?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of gamers and start building your gaming community today. 
            It's free, fast, and designed for serious players.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-6 text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 rounded-lg">
              Get Started Free
            </button>
            <button className="border-2 border-gray-600 text-gray-300 hover:border-purple-400 hover:text-purple-400 px-10 py-6 text-xl font-semibold transition-all duration-300 bg-transparent rounded-lg">
              Learn More
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • Join in under 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
} 
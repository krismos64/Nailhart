import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Sparkles, Star, Palette } from 'lucide-react';

const Home = () => {
  useGSAP(() => {
    gsap.from('.hero-text', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power4.out'
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-text text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              L'Art des Ongles Réinventé
            </h1>
            <p className="hero-text text-xl md:text-2xl text-white/90 mb-8">
              Créez des designs uniques avec notre configurateur interactif
            </p>
            <motion.div
              className="hero-text flex justify-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <a
                href="/configurator"
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
              >
                Commencer maintenant
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-8 w-8 text-pink-500" />,
                title: "Design Moderne",
                description: "Interface intuitive et esthétique pour une expérience utilisateur optimale"
              },
              {
                icon: <Star className="h-8 w-8 text-purple-500" />,
                title: "Personnalisation Avancée",
                description: "Des milliers de combinaisons possibles pour des créations uniques"
              },
              {
                icon: <Palette className="h-8 w-8 text-pink-500" />,
                title: "Prévisualisation en Temps Réel",
                description: "Visualisez vos créations instantanément avant de les réaliser"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-white/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
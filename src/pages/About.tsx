import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            À Propos de NailArt Pro
          </h1>
          <p className="mt-4 text-white/70">
            Notre mission est de révolutionner l'art de la manucure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Heart className="h-8 w-8 text-pink-500" />,
              title: "Notre Passion",
              description: "Nous sommes passionnés par l'art de la manucure et nous voulons partager cette passion avec vous."
            },
            {
              icon: <Users className="h-8 w-8 text-purple-500" />,
              title: "Notre Communauté",
              description: "Rejoignez une communauté grandissante de professionnels et d'amateurs passionnés."
            },
            {
              icon: <Sparkles className="h-8 w-8 text-pink-500" />,
              title: "Notre Vision",
              description: "Rendre l'art de la manucure plus accessible et innovant grâce à la technologie."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10"
            >
              <div className="flex flex-col items-center text-center">
                {item.icon}
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-white/70">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Notre Histoire</h2>
          <p className="text-white/70 leading-relaxed">
            NailArt Pro est né de la volonté de moderniser l'industrie de la manucure en apportant des outils innovants aux professionnels. Notre plateforme permet aux artistes de créer, visualiser et partager leurs créations de manière interactive et professionnelle. Nous croyons en l'alliance de la créativité et de la technologie pour repousser les limites de l'art de la manucure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
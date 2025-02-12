import React from 'react';
import { motion } from 'framer-motion';

const Gallery = () => {
  const nailDesigns = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371",
      title: "Design Néon",
      category: "Moderne"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53",
      title: "Minimaliste",
      category: "Simple"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1601055283742-8b27e81b5553",
      title: "Floral",
      category: "Nature"
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
        >
          Galerie d'Inspiration
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nailDesigns.map((design, index) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-w-3 aspect-h-4">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white">{design.title}</h3>
                  <p className="text-pink-400">{design.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
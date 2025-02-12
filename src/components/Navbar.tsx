import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Image, Palette, Info } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed w-full bg-black/20 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              NailArt Pro
            </span>
          </Link>
          
          <div className="flex space-x-4">
            {[
              { path: '/', icon: <Sparkles />, label: 'Accueil' },
              { path: '/gallery', icon: <Image />, label: 'Galerie' },
              { path: '/configurator', icon: <Palette />, label: 'Configurateur' },
              { path: '/about', icon: <Info />, label: 'À propos' }
            ].map(({ path, icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300
                  ${isActive(path)
                    ? 'bg-white/10 text-pink-500'
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
              >
                {React.cloneElement(icon, { className: 'h-5 w-5' })}
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
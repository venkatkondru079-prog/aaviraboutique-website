import React from 'react';
import { Award, ShieldCheck, Sparkles, MapPin, Phone, Mail, ArrowRight, HeartHandshake } from 'lucide-react';
import { PageTab } from '../types';
import { RamaniPortrait } from '../components/common/RamaniPortrait';

interface AboutViewProps {
  onNavigate: (tab: PageTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="font-sans space-y-20 pb-20">
      {/* 1. Hero Banner */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-[#18130E] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/sarees/wedding-bridal-1-a.jpg"
            alt="Handloom Silk Atelier"
            className="w-full h-full object-cover object-center opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14100C] via-[#14100C]/70 to-[#14100C]/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-3">
            Since Our Inception • Visakhapatnam
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#FAF8F5] leading-tight mb-6">
            The Aavira Legacy
          </h1>
          <p className="text-sm sm:text-base text-[#D9CEBA] font-light max-w-2xl mx-auto leading-relaxed">
            Where ancient temple weaving techniques converge with modern regal grace. Founded by Mrs. K. Ramani,
            Aavira stands as a beacon of uncompromising textile purity and heritage Indian craftsmanship.
          </p>
        </div>
      </section>

      {/* 2. Philosophy & Heritage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold block">
              Our Guiding Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1510] leading-snug">
              Preserving Living Civilizations Through Every Intertwined Thread
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D3E] leading-relaxed">
              In an era dominated by rapid synthetic industrialization, Aavira safeguards the deliberate, soulful cadence of handloom artisans. Every saree is conceived not merely as attire, but as a family heirloom that will grace auspicious celebrations for generations.
            </p>
            <p className="text-xs sm:text-sm text-[#5C4D3E] leading-relaxed">
              We collaborate exclusively with generational master weavers who hold ancestral knowledge of interlocked Korvai pit looms, pure silver-gold zari testing, and hand-embroidered zardozi.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-lg border border-[#E8E0D2] shadow-xs">
                <span className="font-serif text-2xl font-bold text-[#B8860B] block">100%</span>
                <span className="text-xs text-[#524436] font-medium">Certified Silk Mark Purity</span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#E8E0D2] shadow-xs">
                <span className="font-serif text-2xl font-bold text-[#B8860B] block">24+ Days</span>
                <span className="text-xs text-[#524436] font-medium">Looming Time per Masterpiece</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/5 rounded-xl overflow-hidden shadow-2xl border border-[#EADBCE]">
              <img
                src="/assets/sarees/vintage-1-a.jpg"
                alt="Intricate Zari Weaving"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#1C1814] text-[#E8DCC4] p-5 rounded-lg border border-[#C5A059]/40 shadow-xl max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 text-[#C5A059] mb-1">
                <ShieldCheck size={18} />
                <span className="text-xs uppercase tracking-wider font-semibold">Silk Mark India</span>
              </div>
              <p className="text-[11px] text-[#C4B7A1]">
                Every meter of fabric passes strict burn-testing and silver purity verification before receiving our seal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leadership Spotlight: Mrs. K. Ramani */}
      <section className="bg-[#FAF4E8] py-16 border-y border-[#E8DCC4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <RamaniPortrait
                  alt="Mrs. K. Ramani, Founder & Managing Director"
                  className="w-full h-full object-cover"
                  id="about-ramani-portrait"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-center">
                  <p className="font-serif text-lg font-bold">Mrs. K. Ramani</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#C5A059]">Managing Director & Founder</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D9CEBA] text-[#B8860B] text-xs uppercase tracking-widest font-semibold">
                <Award size={13} />
                <span>Executive Leadership</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1510]">
                A Vision of Grandeur: Mrs. K. Ramani
              </h2>

              <p className="text-xs sm:text-sm text-[#5C4D3E] leading-relaxed">
                Under the visionary leadership of <strong>Mrs. K. Ramani</strong>, Aavira has blossomed from a boutique
                atelier into one of Southern India's premier haute couture sanctuaries. Driven by an abiding passion
                for coastal Andhra handloom traditions and Dravidian temple architecture, Mrs. Ramani personally oversees
                every textile curation, artisan partnership, and bespoke bridal fitting.
              </p>

              <div className="bg-white p-4 rounded-lg border border-[#E8E0D2] space-y-2 text-xs text-[#4A3E33]">
                <p className="font-semibold text-[#1A1510] uppercase tracking-wider font-serif">
                  Direct Executive Contact:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#B8860B]" />
                    <a href="mailto:aavira.bo@gmail.com" className="text-[#1A1510] font-medium hover:underline">
                      aavira.bo@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#B8860B]" />
                    <a href="tel:+919347159353" className="text-[#1A1510] font-medium hover:underline">
                      +91 9347159353
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="bg-[#1C1814] text-[#F3EBD4] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#332920] transition-colors flex items-center gap-2"
              >
                <span>Request Executive Bridal Consultation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Master Weavers & Guilds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2" id="about-guilds-heading">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">Artisan Guilds</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1510]">
            The Hands That Weave Legend
          </h2>
          <p className="text-xs text-[#736352]">
            Discover the specialized hereditary guilds responsible for bringing Aavira couture to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-[#E8E0D2] overflow-hidden shadow-xs">
            <div className="h-52 overflow-hidden">
              <img
                src="/assets/sarees/semi-pattu-1-a.jpg"
                alt="Korvai Weavers"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B8860B] font-semibold">Tamil Nadu</span>
              <h3 className="font-serif text-lg text-[#1A1510]">The Korvai Pit Loom Guild</h3>
              <p className="text-xs text-[#5C4D3E] leading-relaxed">
                Requiring two weavers operating in harmonious rhythm, interlocking body and border yarns with zero compromise on strength.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E0D2] overflow-hidden shadow-xs">
            <div className="h-52 overflow-hidden">
              <img
                src="/assets/sarees/vintage-2-a.jpg"
                alt="Banaras Weavers"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B8860B] font-semibold">Uttar Pradesh</span>
              <h3 className="font-serif text-lg text-[#1A1510]">The Kadwa Jangla Masters</h3>
              <p className="text-xs text-[#5C4D3E] leading-relaxed">
                Specialists in hand-engraved wooden Jacquard cards, producing seamless Mughal floral creepers with real silver zari.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E0D2] overflow-hidden shadow-xs">
            <div className="h-52 overflow-hidden">
              <img
                src="/assets/sarees/designer-2-a.jpg"
                alt="Zardozi Atelier"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B8860B] font-semibold">Visakhapatnam</span>
              <h3 className="font-serif text-lg text-[#1A1510]">The Coastal Couture Atelier</h3>
              <p className="text-xs text-[#5C4D3E] leading-relaxed">
                Our flagship design house where pure Kanchipuram bridal silks, designer concept drapes, and bespoke maggam embroidered blouses undergo master styling and fittings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Flagship Experience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1814] text-[#E8DCC4] rounded-2xl overflow-hidden border border-[#3A2E22] grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">Flagship Destination</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF8F5]">
                Ushodhya Junction, Visakhapatnam
              </h2>
              <p className="text-xs sm:text-sm text-[#BDB09B] leading-relaxed font-light">
                Step inside an atmosphere of quiet luxury. Our flagship atelier features private bridal viewing
                lounges, a climate-controlled pure silk sanctuary, and dedicated pattern masters ready to bring your dream silhouette to fruition.
              </p>
            </div>

            <div className="space-y-3 text-xs text-[#D9CEBA] border-t border-[#33271C] pt-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#C5A059]" />
                <span>Ushodhya Junction, MVP Colony, Visakhapatnam, AP — 530017</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#C5A059]" />
                <span>Appointments: +91 9347159353 / aavira.bo@gmail.com</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-[#C5A059] text-[#14100C] hover:bg-[#D9B774] px-6 py-3 rounded text-xs uppercase tracking-widest font-bold transition-colors"
              >
                Plan Your Boutique Visit
              </button>
            </div>
          </div>

          <div className="h-72 lg:h-auto min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
              alt="Aavira Boutique Interior"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

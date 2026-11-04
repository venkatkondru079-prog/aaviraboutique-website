import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Award, ArrowRight, Check, Instagram, MessageCircle } from 'lucide-react';
import { PageTab } from '../types';

interface FooterProps {
  onNavigate: (tab: PageTab) => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      onNavigate('shop');
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#14100C] text-[#D9CEBA] border-t border-[#2D2319] pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top VIP Invitation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#2B2117]">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#3D3023] bg-[#FAF0EC] shrink-0 shadow-xs">
                <img
                  src="/aavira-logo.svg"
                  alt="Aavira Haute Couture"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-serif tracking-[0.24em] text-3xl text-[#FAF6ED] uppercase block">
                AAVIRA
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-sans">
              HAUTE COUTURE • THE ROYAL HERITAGE OF INDIA
            </p>
            <p className="text-sm text-[#A89A84] leading-relaxed max-w-md pt-2">
              Every Aavira garment represents an heirloom of cultural splendor. Handcrafted on authentic
              pit looms and embroidered with genuine gold-washed zari, each creation reflects generations
              of master artisan devotion from the heart of Andhra Pradesh and Southern India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#C5A059]">
              <div className="flex items-center gap-1.5 bg-[#211A13] px-3 py-1.5 rounded border border-[#3D3023]">
                <ShieldCheck size={16} />
                <span>Certified Pure Silk Mark</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#211A13] px-3 py-1.5 rounded border border-[#3D3023]">
                <Award size={16} />
                <span>Tested Real Zari</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-sm tracking-widest text-[#FAF6ED] uppercase border-b border-[#35291E] pb-2">
              Flagship Atelier
            </h4>
            <div className="space-y-3 text-xs text-[#B5A691]">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#FAF6ED]">Aavira Boutique</p>
                  <p>Ushodhya Junction, MVP Colony</p>
                  <p>Visakhapatnam, Andhra Pradesh</p>
                  <p>India — 530017</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#C5A059] shrink-0" />
                <div>
                  <p className="text-[#FAF6ED] font-medium">+91 9347159353</p>
                  <p className="text-[11px] text-[#8A7963]">Managing Director: Mrs. K. Ramani</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#C5A059] shrink-0" />
                <a href="mailto:aavira.bo@gmail.com" className="hover:text-[#FAF6ED] transition-colors">
                  aavira.bo@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-[#C5A059] shrink-0" />
                <span>Mon–Sat: 10:00 AM – 8:30 PM IST</span>
              </div>

              <div className="pt-1 flex flex-wrap gap-2">
                <a 
                  href="https://wa.me/919347159353?text=Hello%20Aavira%20Haute%20Couture,%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:text-[#FAF6ED] transition-colors font-medium bg-[#211A13] px-3 py-1.5 rounded border border-[#3D3023] hover:border-[#25D366]/60 cursor-pointer"
                  title="WhatsApp Concierge"
                >
                  <MessageCircle size={14} className="text-[#25D366]" />
                  <span>WhatsApp: +91 9347159353</span>
                </a>
                <a 
                  href="https://www.instagram.com/aavira.boutique/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:text-[#FAF6ED] transition-colors font-medium bg-[#211A13] px-3 py-1.5 rounded border border-[#3D3023] hover:border-[#C5A059]/60 cursor-pointer"
                  title="Instagram Page"
                >
                  <Instagram size={14} className="text-[#E1306C]" />
                  <span>Follow Us: @aavira.boutique</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif text-sm tracking-widest text-[#FAF6ED] uppercase border-b border-[#35291E] pb-2">
              The Aavira Private Club
            </h4>
            <p className="text-xs text-[#A89A84] leading-relaxed">
              Receive private salon invitations, preview upcoming seasonal bridal collections, and enjoy
              complimentary bespoke concierge consultations.
            </p>

            {newsletterSubscribed ? (
              <div className="bg-[#1C291E] border border-[#2B5433] rounded-md p-3.5 flex items-center gap-2.5 text-xs text-[#A7F3D0]">
                <Check size={18} className="text-[#34D399] shrink-0" />
                <span>Welcome to the Private Club. A personal greeting has been dispatched to your email.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 bg-[#201811] border border-[#3D3022] rounded-md px-3 py-2 text-xs text-[#FAF6ED] placeholder-[#73634F] focus:outline-none focus:border-[#C5A059]"
                    id="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="bg-[#C5A059] text-[#14100C] hover:bg-[#D9B774] px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0"
                    id="newsletter-subscribe-btn"
                  >
                    <span>Join</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-[#73634F]">
                  Discreet, infrequent communiqués. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Middle Navigation Directory */}
        <div className="py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <h5 className="text-[#FAF6ED] uppercase font-serif tracking-wider mb-3 text-xs">Haute Collections</h5>
            <ul className="space-y-2 text-[#9E8E78]">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('daily-wear')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Daily wear sarees (30 Sarees)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('dharmavaram-silk')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Dharmavaram Silk Sarees (4 Sarees)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('venkatagiri-silk')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  VenkataGiri Silk Sarees (10 Sarees)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('venkatagiri-vintage')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  VenkataGiri Vintage Sarees (6 Sarees)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('bridal-sarees')}
                  className="hover:text-[#C5A059] transition-colors text-left cursor-pointer"
                >
                  Bridal Sarees (5 Sarees)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FAF6ED] uppercase font-serif tracking-wider mb-3 text-xs">The Brand</h5>
            <ul className="space-y-2 text-[#9E8E78]">
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#C5A059] transition-colors">The Aavira Legacy</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#C5A059] transition-colors">Our Weaving Guilds</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#C5A059] transition-colors">Leadership: Mrs. K. Ramani</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#C5A059] transition-colors">Visakhapatnam Flagship</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#C5A059] transition-colors">Silk Mark Certification</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FAF6ED] uppercase font-serif tracking-wider mb-3 text-xs">Client Services</h5>
            <ul className="space-y-2 text-[#9E8E78]">
              <li><button onClick={() => onNavigate('returns')} className="hover:text-[#C5A059] text-[#E0B858] font-medium transition-colors">Return &amp; Policy</button></li>
              <li><a href="/terms-and-conditions.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#C5A059] transition-colors inline-flex items-center gap-1">Terms &amp; Conditions of Aavira Boutique</a></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#C5A059] transition-colors">Bespoke Bridal Appointment</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#C5A059] transition-colors">Custom Saree Blouse Tailoring</button></li>
              <li><button onClick={() => onNavigate('returns')} className="hover:text-[#C5A059] transition-colors">Insured Worldwide Delivery</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-[#C5A059] transition-colors">Track Your Consignment</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FAF6ED] uppercase font-serif tracking-wider mb-3 text-xs">Administration</h5>
            <ul className="space-y-2 text-[#9E8E78]">
              <li><button onClick={() => onNavigate('admin')} className="hover:text-[#C5A059] transition-colors flex items-center gap-1">Executive Dashboard <span className="bg-[#2D2115] text-[#C5A059] text-[9px] px-1 rounded">Portal</span></button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-[#C5A059] transition-colors">Orders Management</button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-[#C5A059] transition-colors">Inventory Telemetry</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-[#C5A059] transition-colors">Direct WhatsApp Concierge</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-[#261D15] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#786955]">
          <p id="site-copyright-notice">
            © 2026 AAVIRA HAUTE COUTURE. All Rights Reserved. Founded & Directed by Mrs. K. Ramani. |{' '}
            <span id="site-designed-by" className="text-[#E0B858] font-semibold hover:text-[#F3D78A] transition-colors">
              Designed by Byteboostai
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="/terms-and-conditions.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9CEBA] hover:text-[#E0B858] underline underline-offset-2 transition-colors font-medium"
            >
              Terms &amp; Conditions (AAVIRA BOUTIQUE)
            </a>
            <span>•</span>
            <span>Visakhapatnam, Andhra Pradesh</span>
            <span>•</span>
            <span>Silk Mark Reg. Verified</span>
            <span>•</span>
            <span>Crafted in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

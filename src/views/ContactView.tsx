import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Sparkles, MessageSquare, Calendar, Instagram, MessageCircle } from 'lucide-react';
import { CustomerInquiry } from '../types';
import { RamaniPortrait } from '../components/common/RamaniPortrait';

interface ContactViewProps {
  onInquirySubmitted?: (inquiry: CustomerInquiry) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onInquirySubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Bespoke Bridal Lehenga Consultation',
    preferredDate: '',
    message: '',
  });

  const [submittedInquiry, setSubmittedInquiry] = useState<CustomerInquiry | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry: CustomerInquiry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      inquiryType: formData.inquiryType,
      preferredDate: formData.preferredDate,
      message: formData.message,
      createdAt: new Date().toISOString(),
    };

    setSubmittedInquiry(newInquiry);
    if (onInquirySubmitted) {
      onInquirySubmitted(newInquiry);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2" id="contact-page-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4E8] border border-[#E8DCC4] text-[#B8860B] text-xs uppercase tracking-widest font-semibold">
          <Sparkles size={13} />
          <span>Client Concierge & Boutique</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1510]">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-[#736352] max-w-lg mx-auto font-light">
          We welcome you to schedule a private bridal fitting, discuss bespoke handloom weaving, or speak directly with Managing Director Mrs. K. Ramani.
        </p>
      </div>

      {/* Main Grid: Direct Contact Info vs Interactive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Credentials (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Managing Director Card */}
          <div className="bg-[#1C1814] text-[#E8DCC4] p-6 rounded-xl border border-[#3D3124] shadow-md space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C5A059] shrink-0">
                <RamaniPortrait
                  alt="Mrs. K. Ramani, Founder & Managing Director"
                  className="w-full h-full object-cover"
                  id="contact-ramani-portrait"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
                  Direct Executive Desk
                </span>
                <h3 className="font-serif text-lg text-[#FAF8F5]">Mrs. K. Ramani</h3>
                <p className="text-xs text-[#A89882]">Founder & Managing Director</p>
              </div>
            </div>

            <p className="text-xs text-[#C4B7A1] leading-relaxed border-t border-[#33271C] pt-3">
              “Whether you are planning bridal attire for an auspicious wedding or commissioning an exclusive pure gold zari heirloom, my team and I are devoted to your sartorial delight.”
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-[#FAF8F5]">
                <Phone size={14} className="text-[#C5A059]" />
                <a href="tel:+919347159353" className="hover:text-[#C5A059] font-mono">
                  +91 9347159353
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#FAF8F5]">
                <MessageCircle size={14} className="text-[#25D366]" />
                <a 
                  href="https://wa.me/919347159353?text=Hello%20Aavira%20Haute%20Couture,%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20order." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#25D366] font-medium"
                >
                  WhatsApp Chat: +91 9347159353
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#FAF8F5]">
                <Mail size={14} className="text-[#C5A059]" />
                <a href="mailto:aavira.bo@gmail.com" className="hover:text-[#C5A059]">
                  aavira.bo@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#FAF8F5]">
                <Instagram size={14} className="text-[#E1306C]" />
                <a 
                  href="https://www.instagram.com/aavira.boutique/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#C5A059] font-medium"
                >
                  Follow Us: @aavira.boutique
                </a>
              </div>
            </div>
          </div>

          {/* Flagship Atelier Coordinates */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E0D2] shadow-xs space-y-4">
            <h3 className="font-serif text-base uppercase tracking-wider text-[#1A1510] border-b border-[#F2ECE1] pb-2">
              Boutique Coordinates
            </h3>

            <div className="space-y-3 text-xs text-[#524436]">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1A1510] block">Aavira Boutique</strong>
                  <span>Ushodhya Junction, MVP Colony</span>
                  <br />
                  <span>Visakhapatnam, Andhra Pradesh, India — 530017</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1A1510] block">Visiting Hours</strong>
                  <span>Monday — Saturday: 10:00 AM – 8:30 PM IST</span>
                  <br />
                  <span>Sunday: 11:00 AM – 7:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1A1510] block">Global Virtual Styling</strong>
                  <span>Video consultations over WhatsApp / Zoom available for overseas patrons across the US, UK, Europe, and Middle East.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E0D2] shadow-xs">
            {submittedInquiry ? (
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#EFF8F1] text-[#205A32] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle size={36} />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#B8860B] font-semibold">
                    Inquiry Dispatched
                  </span>
                  <h3 className="font-serif text-2xl text-[#1A1510]">
                    Thank You, {submittedInquiry.name}
                  </h3>
                  <p className="text-xs text-[#736352] max-w-md mx-auto">
                    Your bespoke consultation request has been routed directly to Managing Director Mrs. K. Ramani's desk.
                  </p>
                </div>

                <div className="bg-[#FAF6ED] border border-[#E8DCC4] p-4 rounded-lg max-w-sm mx-auto text-left text-xs space-y-2 text-[#524436]">
                  <div className="flex justify-between">
                    <span className="text-[#8C7A65]">Reference Number:</span>
                    <strong className="text-[#1A1510] font-mono">{submittedInquiry.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7A65]">Subject:</span>
                    <span className="text-[#1A1510] font-medium">{submittedInquiry.inquiryType}</span>
                  </div>
                  {submittedInquiry.preferredDate && (
                    <div className="flex justify-between">
                      <span className="text-[#8C7A65]">Preferred Date:</span>
                      <span className="text-[#1A1510]">{submittedInquiry.preferredDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#E8DCC4] pt-2">
                    <span className="text-[#8C7A65]">Callback Timeframe:</span>
                    <span className="text-[#205A32] font-semibold">Within 4 Business Hours</span>
                  </div>
                </div>

                <button
                  onClick={() => setSubmittedInquiry(null)}
                  className="bg-[#1C1814] text-[#F3EBD4] px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#332920]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl text-[#1A1510]">
                    Schedule a Consultation
                  </h2>
                  <p className="text-xs text-[#736352]">
                    Please provide your preferences so our master stylists may prepare appropriate silk swatches and embroidery boards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A3E33] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyadarshini Rao"
                      className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                      id="contact-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E33] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya.rao@example.com"
                      className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                      id="contact-email-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A3E33] mb-1">Phone Number (with WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 93471 59353"
                      className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                      id="contact-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E33] mb-1">Nature of Inquiry *</label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                      id="contact-inquiry-type"
                    >
                      <option value="Bespoke Bridal Lehenga Consultation">Bespoke Bridal Lehenga Consultation</option>
                      <option value="Custom Kanchipuram Saree Weaving">Custom Kanchipuram Saree Weaving</option>
                      <option value="Couture Evening Gown Trial">Couture Evening Gown Trial</option>
                      <option value="International Export / Bulk Orders">International Export / Bulk Orders</option>
                      <option value="Direct Consultation with Mrs. K. Ramani">Direct Consultation with Mrs. K. Ramani</option>
                      <option value="Order Status & Delivery Logistics">Order Status & Delivery Logistics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Preferred Appointment Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Message & Specific Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your event date, color preferences, silhouette vision, or tailoring requirements..."
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    id="contact-message-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1C1814] text-[#F3EBD4] py-3.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#332920] transition-colors flex items-center justify-center gap-2 shadow-md"
                  id="contact-submit-btn"
                >
                  <Send size={15} />
                  <span>Transmit Inquiry to Atelier</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Map & Flagship Location Section */}
      <div className="bg-[#FAF4E8] rounded-2xl p-6 sm:p-8 border border-[#EADBBD] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#B8860B] font-semibold">Boutique Destination</span>
            <h3 className="font-serif text-2xl text-[#1A1510]">Finding the Visakhapatnam Atelier</h3>
            <p className="text-xs text-[#736352]">Located prominently at Ushodhya Junction with valet parking available for patrons.</p>
          </div>
          <a
            href="https://maps.google.com/?q=Ushodhya+Junction+Visakhapatnam"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-[#D9CEBA] rounded text-xs text-[#1A1510] hover:bg-[#FAF8F5] transition-colors font-medium self-start sm:self-auto flex items-center gap-1.5"
          >
            <MapPin size={14} className="text-[#B8860B]" />
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Visual Map Layout */}
        <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden relative border border-[#D9D0C1] bg-[#E5DFD5]">
          <iframe
            title="Aavira Boutique Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.8519655845183!2d83.33230691537243!3d17.747065987864834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b05615d6545%3A0x6b096f9a0c7eb16a!2sUshodaya%20Junction%2C%20MVP%20Colony%2C%20Visakhapatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="filter grayscale-30 contrast-105"
          />
        </div>
      </div>
    </div>
  );
};

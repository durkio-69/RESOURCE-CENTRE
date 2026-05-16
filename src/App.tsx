import { motion, AnimatePresence } from "motion/react";
import { 
  Printer, 
  Wifi, 
  FileText, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  Monitor,
  Stamp,
  Copy,
  Layers,
  Globe,
  ShieldCheck,
  Zap,
  Calendar,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Music,
  Film,
  Mail,
  ExternalLink,
  Briefcase,
  Bell,
  Award,
  Search,
  Users,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2 as WhatsAppIcon,
  Lock
} from "lucide-react";
const WhatsApp = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const MTNLogo = ({ className }: { className?: string }) => (
  <div className={`bg-[#FFCC00] rounded-lg flex items-center justify-center font-black text-xs text-blue-900 overflow-hidden ${className}`}>
    MTN
  </div>
);

const AirtelLogo = ({ className }: { className?: string }) => (
  <div className={`bg-[#E11900] rounded-lg flex items-center justify-center font-black text-xs text-white overflow-hidden ${className}`}>
    airtel
  </div>
);

import React, { useState, useMemo, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import axios from "axios";
import { 
  bookingsRef, 
  inquiriesRef, 
  usersRef,
  addDoc, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "./firebase";
import { User } from "firebase/auth";

type BookingStep = "service" | "datetime" | "details" | "confirmation";

interface BookingData {
  service: string;
  date: string;
  time: string;
  surname: string;
  givenName: string;
  email: string;
  phone: string;
  message: string;
}

const services = [
  {
    id: "stationery",
    title: "Stationery & Branding",
    description: "Professional printing, photocopying, and creative branding for individuals and businesses.",
    summary: "Printing, Branding, Binding, ID Photos",
    icon: <Printer className="w-8 h-8" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
    accent: "bg-blue-600",
    buttonHover: "hover:bg-blue-600 hover:border-blue-600",
    items: ["High-speed Printing", "Color Branding", "Binding & Laminating", "Business Documentation", "Passport Photography"]
  },
  {
    id: "government",
    title: "Govt & Success Portal",
    description: "Navigate government applications, tax portals, and professional job applications with expert help.",
    summary: "URA, NIRA, Passport, Job Apps",
    icon: <Briefcase className="w-8 h-8" />,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-600",
    accent: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-600 hover:border-emerald-600",
    items: ["URA/TIN Support", "NIRA & Passport Forms", "Online Job Portals", "Scholarship Guidance", "Visa Documentation"]
  },
  {
    id: "training",
    title: "Skill Hub Academy",
    description: "Practical training in high-demand digital skills to prepare you for the global economy.",
    summary: "Desktop, Design, Web, Business",
    icon: <Monitor className="w-8 h-8" />,
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-600",
    accent: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-600 hover:border-indigo-600",
    items: ["Computer Essentials", "Graphic Design", "Web Development", "Business Planning", "Digital Marketing"]
  }
];

const tabData: Record<string, { name: string, items: string[], icon: React.ReactNode, bgImages?: string[], description: string }[]> = {
  "Stationery": [
    { 
      name: "Printing & Photocopy", 
      items: ["B&W Print - UGX 200", "Color Print - UGX 1000", "Laminating - UGX 1500", "Full Binding - UGX 3000", "Photocopying - UGX 100"], 
      icon: <Printer className="w-5 h-5" />,
      description: "Professional printing and high-volume photocopying services for all your document needs.",
      bgImages: [
        "https://images.unsplash.com/photo-1512418490979-92798ccc13b0?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1562654501-a0ccc0af3fa1?auto=format&fit=crop&q=80&w=800"
      ]
    },
    { 
      name: "Creative Hub", 
      items: ["Logo Design", "Business Cards", "Posters/Flyers", "Curriculum Vitae", "Letterheads"], 
      icon: <FileText className="w-5 h-5" />,
      description: "Stand out with professional branding and well-designed corporate identity materials.",
      bgImages: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800"]
    }
  ],
  "Applications": [
    { 
      name: "Govt Portals", 
      description: "Expert assistance with URA, E-Tax, Passports, and Driver Permits.",
      items: ["E-Tax & URA - UGX 3000", "Passport Help - UGX 5000", "Driver Permit - UGX 5000", "National ID - UGX 2000"], 
      icon: <Globe className="w-5 h-5" />,
      bgImages: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800"]
    },
    { 
      name: "Success Portal", 
      description: "Help with online job portals, school admissions, and scholarship applications.",
      items: ["Job Portals - UGX 2000", "Uni Admissions - UGX 5000", "Visa Forms - UGX 10000", "Scholarships - UGX 4000"],
      icon: <Stamp className="w-5 h-5" />,
      bgImages: ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"]
    }
  ],
  "Training": [
    { 
      name: "Digital Mastery", 
      description: "Structured computer courses from basics to advanced professional tools.",
      items: ["Microsoft Suite - UGX 30000", "Adobe Illustrator - UGX 50000", "Web Design (HTML/CSS) - UGX 80000", "Cybersecurity Basics - UGX 40000"],
      icon: <Monitor className="w-5 h-5" />,
      bgImages: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"]
    }
  ],
  "Space": [
    { 
      name: "Work Hub", 
      description: "Rent a desk or a meeting room with ultra-fast Wi-Fi and power backup.",
      items: ["Daily Desk - UGX 5000", "Meeting Room (Hr) - UGX 10000", "Student Desk - UGX 2000", "Weekly Membership - UGX 20000"],
      icon: <Users className="w-5 h-5" />,
      bgImages: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"]
    }
  ]
};

const PaymentModal = ({ isOpen, onClose, itemName, amount }: { isOpen: boolean, onClose: () => void, itemName: string, amount: string }) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("onlinestuffs696@gmail.com");
  const [step, setStep] = useState<"input" | "processing" | "success" | "error">("input");

  const [errorMessage, setErrorMessage] = useState("");

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;

  const handlePay = async () => {
    if (!phone || !email) return;
    setStep("processing");
    setErrorMessage("");

    try {
      const response = await axios.post("/api/pesapal/initiate", {
        amount: numericAmount,
        phone,
        email,
        itemName,
        description: `Payment for ${itemName} at Youth City Hub`
      });

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        setStep("error");
        setErrorMessage("Invalid response from payment server.");
      }
    } catch (error: any) {
      console.error("Pesapal initiation error:", error);
      setStep("error");
      setErrorMessage(error.response?.data?.error || "Unable to connect to the payment server. Ensure the backend is running.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        {step === "input" && (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Secure Checkout</h3>
              <p className="text-slate-500 font-medium">{itemName} • <span className="text-indigo-600 font-bold">{amount}</span></p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex gap-1">
                  <MTNLogo className="w-10 h-6 text-[8px]" />
                  <AirtelLogo className="w-10 h-6 text-[8px]" />
                </div>
                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Supports Uganda Mobile Money & Cards</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePay}
                  disabled={!phone || !email}
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <span>Pay with Pesapal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Opening Secure Gateway...</h3>
            <p className="text-slate-500 font-medium max-w-[200px]">Please complete the payment in the secure popup window</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500 font-medium mb-8">Your transaction has been verified. Thank you for your business!</p>
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Close Window
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-8">
              <X className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Payment Failed</h3>
            <p className="text-slate-500 font-medium mb-4">Something went wrong with the transaction.</p>
            {errorMessage && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-mono text-rose-600 break-words w-full">
                Error: {errorMessage}
              </div>
            )}
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setStep("input")}
                className="flex-1 px-4 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const SlideshowCard = ({ name, items, icon, color, bgImages, description }: { name: string, items: string[], icon: React.ReactNode, color: string, bgImages?: string[], description: string, key?: string | number }) => {
  const [index, setIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{ name: string, amount: string } | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500 + Math.random() * 1000);
    return () => clearInterval(timer);
  }, [items.length]);

  React.useEffect(() => {
    if (bgImages && bgImages.length > 1) {
      const timer = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % bgImages.length);
      }, 6000 + Math.random() * 2000);
      return () => clearInterval(timer);
    }
  }, [bgImages]);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/256757808474?text=I'm inquiring about ${name} services`, '_blank');
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:onlinestuffs696@gmail.com?subject=Service Inquiry: ${name}`;
  };

  return (
    <motion.div 
      whileHover={!showInfo ? { scale: 1.02 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setShowInfo(!showInfo)}
      className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:bg-white hover:border-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-200/20 transition-all flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden cursor-pointer"
    >
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] cursor-default"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(false);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl max-h-[85vh] z-[101] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Background */}
              <div className="relative h-40 sm:h-64 shrink-0 overflow-hidden">
                {bgImages && bgImages.length > 0 && (
                  <img 
                    src={bgImages[bgIndex]} 
                    alt={name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-800 hover:bg-white transition-colors shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-8">
                  <div className="inline-flex p-3 bg-white rounded-2xl shadow-xl text-indigo-600 mb-4">{icon}</div>
                  <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{name}</h4>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8">
                  {description}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase text-indigo-500 tracking-[0.2em]">Service Catalog</p>
                    <div className="h-px bg-slate-100 flex-1 ml-4"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item, i) => {
                      const [itemName, itemPrice] = item.split(" - ");
                      return (
                        <motion.div 
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (itemPrice) {
                              setPaymentItem({ name: itemName, amount: itemPrice });
                            }
                          }}
                          className="flex items-center justify-between space-x-3 text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group/item"
                        >
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span className="leading-tight">{itemName}</span>
                          </div>
                          {itemPrice && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-indigo-600 font-black">{itemPrice}</span>
                              <span className="text-[8px] text-slate-400 uppercase tracking-tighter group-hover/item:text-indigo-500 transition-colors">Tap to Pay</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Payment Modal Component */}
              {paymentItem && (
                <PaymentModal 
                  isOpen={true} 
                  onClose={() => setPaymentItem(null)} 
                  itemName={paymentItem.name} 
                  amount={paymentItem.amount} 
                />
              )}

              {/* Footer Actions */}
              <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                <button 
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center space-x-3 bg-[#25D366] text-white py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-100"
                >
                  <WhatsApp className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </button>
                <button 
                  onClick={handleEmail}
                  className="flex items-center justify-center space-x-3 bg-indigo-600 text-white py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-100"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send an Email</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Background Slideshow */}
      {bgImages && bgImages.length > 0 && (
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <img 
                src={bgImages[bgIndex]} 
                alt={`${name} background`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          {/* Gradients to keep content readable */}
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-white/70 group-hover:from-white group-hover:via-white/95 group-hover:to-white/90 transition-all"></div>
        </div>
      )}

      <div className="relative z-10">
        <div className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{name}</h5>
        <div className="relative h-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}
              className="text-lg md:text-xl font-black text-slate-900 leading-tight uppercase absolute inset-0 line-clamp-2"
            >
              {items[index]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1 relative z-10">
          {items.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === index ? 'w-4 bg-indigo-600' : 'w-1 bg-slate-300'}`} />
          ))}
      </div>
    </motion.div>
  );
};

const HeroBackground = () => {
  const [index, setIndex] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1523240693567-579c48b019b0?auto=format&fit=crop&q=80&w=1920", // Students
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1920", // Youth
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1920", // Children
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1920"  // Tech
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={heroImages[index]} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Stationery");
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user to Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: 'member',
            createdAt: serverTimestamp()
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(userCredential.user, { displayName: authDisplayName });
      // Sync to Firestore manually since profile update happens after creation
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        displayName: authDisplayName,
        email: authEmail,
        photoURL: null,
        role: 'member',
        createdAt: serverTimestamp()
      });
      setIsAuthModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthDisplayName("");
    } catch (error: any) {
      console.error("Signup failed:", error);
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setIsAuthModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ item: string, amount: string } | null>(null);

  useEffect(() => {
    // Detect PesaPal redirect parameters
    const params = new URLSearchParams(window.location.search);
    const trackingId = params.get('OrderTrackingId');
    const item = params.get('item');
    const amt = params.get('amt');

    if (trackingId) {
      if (item && amt) {
        setPaymentSuccessData({ item, amount: amt });
      }
      setShowSuccessToast(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Hide toast after 15 seconds
      setTimeout(() => setShowSuccessToast(false), 15000);
    }
  }, []);

  const fetchMyBookings = async () => {
    if (!user) return;
    const { query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
    try {
      const q = query(
        bookingsRef, 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'bookings', bookingId));
      setMyBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bookings');
    }
  };

  useEffect(() => {
    if (isMyBookingsOpen) fetchMyBookings();
  }, [isMyBookingsOpen]);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model", parts: { text: string }[] }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", parts: [{ text: userMsg }] }]);
    setIsTyping(true);

    try {
      const response = await axios.post("/api/chat", { 
        message: userMsg,
        history: chatHistory
      });
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: response.data.text }] }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("service");
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    date: "",
    time: "",
    surname: "",
    givenName: "",
    email: user?.email || "",
    phone: "+256",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [inquiryData, setInquiryData] = useState({
    fullName: "",
    email: "",
    type: "Stationery Services",
    message: ""
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const availableTimes = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  
  const resetBooking = () => {
    setIsBookingOpen(false);
    setConfirmedBookingId(null);
    setTimeout(() => {
      setBookingStep("service");
      setBookingData({
        service: "",
        date: "",
        time: "",
        surname: "",
        givenName: "",
        email: "",
        phone: "+256",
        message: "",
      });
    }, 300);
  };

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    const bookingId = `YC-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await addDoc(bookingsRef, {
        ...bookingData,
        userId: user?.uid || null,
        bookingId,
        status: 'confirmed',
        createdAt: serverTimestamp()
      });
      setConfirmedBookingId(bookingId);
      setBookingStep("confirmation");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(inquiriesRef, {
        ...inquiryData,
        createdAt: serverTimestamp()
      });
      alert("Inquiry submitted successfully!");
      setInquiryData({
        fullName: "",
        email: "",
        type: "Stationery Services",
        message: ""
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inquiries');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (bookingStep === "service") setBookingStep("details");
    else if (bookingStep === "details") handleBookingSubmit();
  };

  const handlePrevStep = () => {
    if (bookingStep === "details") setBookingStep("service");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex items-center">
              <a href="#" className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-indigo-50 rounded-full flex items-center justify-center font-bold group-hover:scale-105 transition-transform overflow-hidden relative shadow-sm border border-indigo-100/50">
                  <img src="https://cityandhackneyneighbourhoods.org.uk/wp-content/uploads/2024/03/Untitled.jpg" alt="Youth City Hub" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-black text-base sm:text-xl tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">
                  YOUTH CITY<span className="text-indigo-600 font-medium sm:inline hidden lg:inline ml-1">RESOURCE CENTRE</span>
                </span>
              </a>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <a href="#services" className="hover:text-indigo-600 transition-colors">Services</a>
              <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
              <a href="https://ee.kobotoolbox.org/x/j0btjl7c" target="_blank" rel="noopener noreferrer" className="flex items-center bg-indigo-50/50 border border-indigo-100/30 p-1.5 px-3 rounded-xl space-x-2 hover:bg-indigo-100 transition-all cursor-pointer group">
                <Wifi className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter leading-none">Free Wi-Fi</span>
              </a>
              <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsMyBookingsOpen(true)}
                    className="hidden sm:flex items-center space-x-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </button>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none">{user.displayName || 'Member'}</p>
                    <button onClick={handleLogout} className="text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase transition-colors">Logout</button>
                  </div>
                  <div className="w-10 h-10 border-2 border-indigo-100 rounded-full overflow-hidden shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2 rounded-xl group"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sign In</span>
                </button>
              )}
              
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
              >
                Book Now
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : (
                  <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-current rounded-full"></div>
                    <div className="w-4 h-0.5 bg-current rounded-full"></div>
                    <div className="w-6 h-0.5 bg-current rounded-full"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {[
                  { label: 'Services', href: '#services' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                  { label: 'Free Wi-Fi', href: 'https://ee.kobotoolbox.org/x/j0btjl7c', external: true }
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {link.label}
                  </a>
                ))}
                
                {user ? (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMyBookingsOpen(true); }}
                    className="w-full text-left px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                  >
                    Dashboard & Bookings
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                    className="w-full text-left px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Log In / Register
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <HeroBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 bg-indigo-50/80 backdrop-blur-sm text-indigo-700 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100/50">
                <Zap className="w-4 h-4 fill-indigo-700 shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
                <span>Empowering Uganda's Youth</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9] uppercase">
                Your Hub for <br /><span className="text-indigo-600">Growth</span> <br />and Opportunities.
              </h1>
              <p className="text-base sm:text-xl text-slate-600 mb-12 max-w-lg leading-relaxed font-medium">
                The ultimate destination for professional stationery, 
                career growth, essential digital services, and community collaboration.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center justify-center bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all group shadow-2xl shadow-indigo-200/50 hover:-translate-y-1 active:translate-y-0"
                >
                  Book Appointment
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#opportunities"
                  className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md text-slate-800 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-white transition-all shadow-xl shadow-slate-100/50 hover:-translate-y-1 active:translate-y-0"
                >
                  Browse Opportunities
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section Removed */}

      {/* Services Section */}
      <section id="services" className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 px-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4">What we offer</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase leading-[0.95]">Built for the <br />Digital Citizen.</h3>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              We provide essential services to help you navigate the modern landscape, 
              whether it's administrative work or staying connected online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all flex flex-col h-full group"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${service.bg} border ${service.border} rounded-2xl flex items-center justify-center ${service.text} mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-tight">{service.title}</h4>
                <p className="text-sm sm:text-base text-slate-500 mb-8 flex-grow leading-relaxed font-medium">
                  {service.description}
                </p>
                <ul className="space-y-4 mb-10">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-center text-xs sm:text-sm font-bold text-slate-700">
                      <div className={`w-1.5 h-1.5 ${service.accent} rounded-full mr-3 shadow-[0_0_8px_rgba(79,70,229,0.4)]`}></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    setBookingData(prev => ({ ...prev, service: service.title }));
                    setIsBookingOpen(true);
                    setBookingStep("details");
                  }}
                  className={`w-full py-5 px-6 rounded-2xl border-2 border-slate-100 font-black ${service.buttonHover} hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] shadow-sm hover:shadow-lg`}
                >
                  Select Service
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase / Why Us */}
       <section id="about" className="py-24 sm:py-32 bg-indigo-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 sm:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">Resource Centre Excellence</h2>
              <h3 className="text-4xl sm:text-6xl font-black mb-10 leading-[0.95] uppercase tracking-tighter">Fast. <br />Accessible. <br />Committed <br />to You.</h3>
              
              <div className="space-y-8 sm:space-y-12">
                {[
                  { icon: <Monitor />, title: "Modern Infrastructure", desc: "Equipped with high-performance workstations and industrial-grade printing equipment." },
                  { icon: <Globe />, title: "Global Connectivity", desc: "Our free 100Mbps Wi-Fi ensures you're always connected to global opportunities." },
                  { icon: <Stamp />, title: "Certified Assistance", desc: "Expert help with government forms and administrative compliance." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 sm:gap-8 group">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-indigo-900 border border-indigo-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg">
                      {item.icon && React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-6 h-6 sm:w-8 sm:h-8" }) : null}
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black mb-2 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-sm sm:text-base text-indigo-200/60 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl aspect-[4/5] sm:aspect-square">
                 <img 
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000" 
                  alt="Modern workspace" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/20 to-transparent"></div>
                 
                 <div className="absolute bottom-10 left-10 right-10">
                   <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-4 inline-flex">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Centre Open Now</span>
                   </div>
                   <p className="text-2xl sm:text-4xl font-black max-w-xs leading-[0.95] text-white uppercase">Your workspace <br />in the heart <br />of the city.</p>
                 </div>
              </div>
              
              {/* Floating micro-widget */}
              <div className="absolute -top-12 -left-12 hidden xl:block">
                 <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="bg-white text-indigo-950 p-8 rounded-[2.5rem] shadow-3xl border border-indigo-100 flex flex-col items-center"
                 >
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                     <Wifi className="w-8 h-8 text-indigo-600" />
                   </div>
                   <div className="text-center mb-4">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Live Connection</div>
                      <div className="text-base font-black">100 Mbps Fibre</div>
                   </div>
                   <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        className="h-full bg-indigo-600" 
                      />
                   </div>
                 </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="opportunities" className="py-24 sm:py-32 bg-indigo-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4">Latest Board</h2>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">Opportunities <br />Ready for You.</h3>
              <p className="text-slate-500 font-medium text-base sm:text-lg">Fresh scholarships, internships, and entry-level positions curated for our community.</p>
            </div>
            <button className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Search All Ops</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { type: "Scholarship", title: "Merit Tech Grant 2026", org: "DigiUganda Foundation", dead: "June 30", color: "bg-emerald-50 text-emerald-600", icon: <Award /> },
              { type: "Internship", title: "Junior UI Designer", org: "Creative Hub Kampala", dead: "May 25", color: "bg-blue-50 text-blue-600", icon: <Briefcase /> },
              { type: "Training", title: "Advanced Web Dev", org: "Youth City Hub", dead: "May 20", color: "bg-indigo-50 text-indigo-600", icon: <Zap /> },
              { type: "Job", title: "Office Assistant", org: "Green Logistics LTD", dead: "June 05", color: "bg-orange-50 text-orange-600", icon: <FileText /> },
              { type: "Event", title: "Youth Startup Summit", org: "Mbuya Youth Council", dead: "May 28", color: "bg-purple-50 text-purple-600", icon: <Calendar /> },
              { type: "Service", title: "Free ID Registration", org: "NIRA Outreach", dead: "Ongoing", color: "bg-pink-50 text-pink-600", icon: <Stamp /> }
            ].map((op, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${op.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    {op.icon && React.isValidElement(op.icon) ? React.cloneElement(op.icon as React.ReactElement<any>, { className: "w-6 h-6" }) : null}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${op.color} bg-opacity-40`}>
                    {op.type}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2 uppercase leading-tight tracking-tight">{op.title}</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{op.org}</p>
                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-3 h-3 mr-2" />
                    <span>Ends: {op.dead}</span>
                  </div>
                  <button className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Notice Board */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-20 px-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Hub Announcements</h2>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Community <br />Notice Board.</h3>
           </div>

           <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[
                { title: "Internet Maintenance", content: "Minor Wi-Fi downtime expected on Friday morning for fibre upgrades.", date: "Today", tag: "Tech" },
                { title: "New Printer Arrived!", content: "Our new A3 industrial color printer is now online. Highest quality in Kinawataka!", date: "Yesterday", tag: "Update" },
                { title: "Found: National ID", content: "National ID found near the counter. Name: Robert O. Please visit the office.", date: "2 days ago", tag: "Lost & Found" },
                { title: "Job Fair 2026", content: "Register now for the career fair at the Hub on June 15th.", date: "3 days ago", tag: "Event" },
                { title: "Laptop Charging Policy", content: "Please use designated charging stations for your devices. Free for members.", date: "1 week ago", tag: "Policy" }
              ].map((notice, i) => (
                <div key={i} className="break-inside-avoid bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">{notice.tag}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{notice.date}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tight">{notice.title}</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{notice.content}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
      {/* Pricing / Rapid Services List */}
      <section className="py-24 sm:py-32 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Express Pricing</h2>
                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 leading-[0.95] uppercase">Transparent <br />Rates.</h3>
                <p className="text-slate-500 text-base sm:text-lg font-medium">No hidden fees. Just quality service at affordable rates for the community hub.</p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
                   {["Stationery", "Applications", "Training", "Space"].map(tab => (
                     <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-6 sm:px-8 py-3.5 rounded-xl transition-all font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap ${activeTab === tab ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       {tab === "Applications" ? "Apps & Gov Portal" : tab}
                     </button>
                   ))}
                </div>
                <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Find a service (e.g. URA, TIN...)"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
           </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {tabData[activeTab]?.map((item, i) => (
                <SlideshowCard 
                  key={`${activeTab}-${i}`}
                  name={item.name}
                  items={item.items}
                  icon={item.icon}
                  bgImages={item.bgImages}
                  description={item.description}
                  color="indigo"
                />
              ))}
            </div>
           
           <p className="mt-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">* Scanning is free when using other stationery services.</p>
        </div>
      </section>

      {/* Contact & Location */}
      <section id="contact" className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-3xl shadow-slate-200/50 overflow-hidden grid lg:grid-cols-2 border border-slate-200">
            <div className="p-8 sm:p-12 lg:p-20">
              <h3 className="text-3xl sm:text-5xl font-black text-slate-900 mb-10 tracking-tight uppercase leading-[0.9]">Get In <br />Touch.</h3>
              <form className="space-y-6" onSubmit={handleInquirySubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      required
                      value={inquiryData.fullName}
                      onChange={(e) => setInquiryData({ ...inquiryData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none placeholder:text-slate-300 font-bold transition-all shadow-inner" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="onlinestuffs696@gmail.com" 
                      required
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none placeholder:text-slate-300 font-bold transition-all shadow-inner" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Inquiry Type</label>
                  <select 
                    value={inquiryData.type}
                    onChange={(e) => setInquiryData({ ...inquiryData, type: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold appearance-none transition-all shadow-inner"
                  >
                    <option>Stationery Services</option>
                    <option>Government Applications</option>
                    <option>Wi-Fi Access Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Message</label>
                  <textarea 
                    rows={4} 
                    required
                    placeholder="How can we help you today?" 
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none placeholder:text-slate-300 font-bold transition-all resize-none shadow-inner"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white w-full py-5 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 tracking-widest text-xs uppercase disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            </div>
            
            <div className="bg-white p-8 sm:p-12 lg:p-20 text-slate-900 border-l border-slate-100 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10 font-bold">
                  <h4 className="text-2xl sm:text-3xl font-black mb-12 tracking-tight text-indigo-600 uppercase">Contact Info</h4>
                  <div className="space-y-10 sm:space-y-12">
                    {[
                      { icon: <MapPin />, label: "Location", val: "Robert Mugabe Road, Kinawataka, Mbuya" },
                      { icon: <Phone />, label: "Call Us", val: "+256 765 507999 / +256 757 808474" },
                      { icon: <WhatsApp />, label: "WhatsApp", val: "+256 757 808474 / +256 765 507999" },
                      { icon: <Mail />, label: "Email Address", val: "onlinestuffs696@gmail.com" },
                      { icon: <Clock />, label: "Hours", val: "Mon-Sat: 08:00-20:00, Sun: 09:30-17:00" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-6 sm:space-x-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-sm">
                          {item.icon && React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5 sm:w-6 sm:h-6" }) : null}
                        </div>
                        <div>
                          <p className="font-black text-[10px] tracking-widest mb-1.5 text-slate-400 uppercase">{item.label}</p>
                          <p className="text-slate-900 font-black text-sm sm:text-base leading-tight">
                            {item.val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 pt-24 pb-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://cityandhackneyneighbourhoods.org.uk/wp-content/uploads/2024/03/Untitled.jpg" alt="Hub" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-black text-white tracking-tighter text-xl">
                  YOUTH CITY HUB<span className="text-indigo-500">.</span>
                </span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-8 max-w-sm">
                Empowering the youth of Kinawataka and Mbuya with essential digital services, skills training, and community resources.
              </p>
              <div className="flex space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer group">
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                   </div>
                 ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Resources</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#services" className="hover:text-white transition-colors">Digital Stationery</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Govt Applications</a></li>
                <li><a href="#opportunities" className="hover:text-white transition-colors">Job Board</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Space Rental</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">The Hub</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Weekly Newsletter</h4>
              <p className="text-sm font-medium mb-6 leading-relaxed">Stay updated on new jobs and workshops at the hub.</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                   Join
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xs font-bold tracking-tight opacity-50 uppercase">
              © {new Date().getFullYear()} YOUTH CITY HUB. ALL RIGHTS RESERVED.
            </div>
            <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest opacity-50">
               <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
               <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
               <a href="#" className="hover:opacity-100 transition-opacity">Impact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetBooking}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-4">
                {bookingStep !== "service" && bookingStep !== "confirmation" && (
                  <button 
                    onClick={handlePrevStep}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                  </button>
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Book Appointment Now</h3>
                  <p className="text-xs font-black tracking-widest text-indigo-600">
                    Step {bookingStep === "service" ? 1 : bookingStep === "details" ? 2 : 3} of 3
                  </p>
                </div>
              </div>
              <button 
                onClick={resetBooking}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {bookingStep === "service" && (
                <div className="space-y-4">
                  <p className="text-slate-600 font-medium mb-6">Select the service you'd like to book for:</p>
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setBookingData({ ...bookingData, service: s.title });
                        handleNextStep();
                      }}
                       className={`w-full p-6 rounded-3xl border-2 text-left transition-all group flex items-start space-x-6 ${bookingData.service === s.title ? `${s.border.replace('border-', 'border-').replace('100', '600')} ${s.bg} shadow-lg shadow-indigo-100/50` : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative ${bookingData.service === s.title ? `${s.accent} text-white` : `bg-slate-100 text-slate-500 group-hover:${s.bg} group-hover:${s.text}`}`}>
                        {s.icon}
                        {bookingData.service === s.title && (
                          <div className={`absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border ${s.text.replace('text-', 'border-')}`}>
                             <CheckCircle className={`w-3 h-3 ${s.text} fill-current`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold transition-colors ${bookingData.service === s.title ? s.text : 'text-slate-900 group-hover:text-indigo-600'}`}>{s.title}</h4>
                          {bookingData.service === s.title && <CheckCircle className={`w-5 h-5 ${s.text}`} />}
                        </div>
                        <p className={`text-xs font-black ${bookingData.service === s.title ? s.text : 'text-indigo-400'} mt-0.5 tracking-widest`}>{s.summary}</p>
                        <p className="text-sm text-slate-500 leading-relaxed mt-2">{s.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {bookingStep === "details" && (
                <div className="space-y-6">
                  {/* Appointment Summary Box */}
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex items-center space-x-6 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                      {bookingData.service === "Stationery Work" ? <Printer className="w-6 h-6" /> : 
                       bookingData.service === "Government Services" ? <FileText className="w-6 h-6" /> : 
                       bookingData.service === "Free Wi-Fi" ? <Wifi className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 tracking-widest mb-1">Service Selection</p>
                      <p className="font-bold text-slate-900 leading-tight">
                        {bookingData.service}
                      </p>
                    </div>
                  </div>

                  {/* Personal Details (Latest Requirements) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900 px-1">Surname</label>
                      <input 
                        type="text" 
                        placeholder="Mugabe" 
                        value={bookingData.surname}
                        onChange={(e) => setBookingData({ ...bookingData, surname: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900 px-1">Given Name</label>
                      <input 
                        type="text" 
                        placeholder="Robert" 
                        value={bookingData.givenName}
                        onChange={(e) => setBookingData({ ...bookingData, givenName: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-900 px-1">Telephone Number</label>
                     <input 
                      type="tel" 
                      placeholder="+256..." 
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold transition-all text-indigo-600" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 px-1">Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="robert@example.com" 
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 px-1">Message Box</label>
                    <textarea 
                      rows={3}
                      placeholder="Leave a message for us..." 
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold transition-all resize-none" 
                    />
                  </div>

                  <button 
                    disabled={!bookingData.surname || !bookingData.givenName || !bookingData.phone || isSubmitting}
                    onClick={handleNextStep}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none tracking-widest text-xs"
                  >
                    {isSubmitting ? "Processing..." : "Submit"}
                  </button>
                </div>
              )}

              {bookingStep === "confirmation" && (
                <div className="py-8 flex flex-col items-center text-center">
                   <div className="w-20 h-20 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle className="w-10 h-10 text-green-600" />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Booking Confirmed!</h3>
                   <p className="text-slate-600 max-w-sm mb-8 leading-relaxed text-sm">
                     Thank you <span className="font-bold text-indigo-600">{bookingData.givenName}</span>! Your appointment for <span className="font-bold">{bookingData.service}</span> has been successfully scheduled.
                   </p>
                   
                   <div className="w-full bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-4 border border-slate-100">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Booking ID</span>
                        <span className="font-mono text-sm font-black text-indigo-600">{confirmedBookingId}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                         <div className="p-2 bg-white rounded-xl mb-3">
                           <QRCodeSVG 
                             value={`BookingID: ${confirmedBookingId}\nCustomer: ${bookingData.surname} ${bookingData.givenName}\nService: ${bookingData.service}\nPhone: ${bookingData.phone}`} 
                             size={140}
                             level="H"
                             includeMargin={true}
                           />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan at entrance</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appointment Details</p>
                        <p className="text-sm font-bold text-slate-700">{bookingData.service}</p>
                        <p className="text-xs text-slate-500">{bookingData.phone}</p>
                      </div>
                   </div>

                   <button 
                    onClick={resetBooking}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all tracking-[0.2em] text-xs uppercase"
                   >
                    Done
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* My Bookings Modal */}
      <AnimatePresence>
        {isMyBookingsOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMyBookingsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Your Hub Bookings.</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Recent appointments & services</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMyBookingsOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {myBookings.length > 0 ? (
                    myBookings.map((booking) => (
                      <div key={booking.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-indigo-200 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 font-bold text-xs uppercase">
                            {booking.service.substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{booking.service}</h4>
                            <p className="text-slate-500 text-xs font-medium">{booking.date} at {booking.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            {booking.status || 'Pending'}
                          </div>
                          <button 
                            onClick={() => cancelBooking(booking.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <span className="hidden sm:inline text-[10px] font-mono text-slate-400 uppercase">{booking.bookingId}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-medium">You haven't made any bookings yet.</p>
                      <button 
                        onClick={() => { setIsMyBookingsOpen(false); setIsBookingOpen(true); }}
                        className="mt-6 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all"
                      >
                        Book Your First Service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="flex bg-slate-100 p-2 m-6 mb-0 rounded-2xl">
                 {["login", "signup"].map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setAuthTab(tab as any)}
                     className={`flex-1 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${authTab === tab ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     {tab === "login" ? "Login" : "Register"}
                   </button>
                 ))}
              </div>

              <div className="p-10 pt-6 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  {authTab === "login" ? <Users className="w-10 h-10 text-indigo-600" /> : <Award className="w-10 h-10 text-indigo-600" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2 leading-none">
                  {authTab === "login" ? "Welcome Back." : "Create Account."}
                </h3>
                <p className="text-slate-500 font-medium mb-8 text-sm">
                  {authTab === "login" 
                    ? "Access your dashboard and manage your hub activity effortlessly." 
                    : "Join the largest youth resource community in Kinawataka today."}
                </p>

                {authError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-relaxed">
                    {authError}
                  </div>
                )}
                
                <form onSubmit={authTab === "login" ? handleEmailLogin : handleEmailSignup} className="space-y-4 mb-8">
                  {authTab === "signup" && (
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="Full Name"
                        value={authDisplayName}
                        onChange={(e) => setAuthDisplayName(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email"
                      required
                      placeholder="Email Address"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password"
                      required
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {isAuthLoading ? "Processing..." : (authTab === "login" ? "Sign In" : "Create Account")}
                  </button>
                </form>
                
                <div className="relative py-4 mb-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="px-4 bg-white text-slate-300">Or continue with</span></div>
                </div>

                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-white hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50 group"
                  >
                    <Globe className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>Google Account</span>
                  </button>
                  
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    By continuing, you agree to the <br /> Youth City Hub terms of service.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 p-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-[120] w-full max-w-sm px-4"
          >
            <div className="bg-emerald-600 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col space-y-4 border-2 border-emerald-400/30 backdrop-blur-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-tight">Payment Received!</h4>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-tight">
                    {paymentSuccessData 
                      ? `Paid UGX ${paymentSuccessData.amount} for ${paymentSuccessData.item}`
                      : "Your transaction was successful. Check your bookings for updates."}
                  </p>
                </div>
                <button onClick={() => setShowSuccessToast(false)} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowSuccessToast(false); setIsMyBookingsOpen(true); }}
                  className="flex-1 bg-white text-emerald-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors"
                >
                  View My Bookings
                </button>
                <button 
                  onClick={() => setShowSuccessToast(false)}
                  className="flex-1 bg-emerald-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-white w-[350px] sm:w-[400px] h-[500px] rounded-[2.5rem] shadow-3xl border border-slate-100 flex flex-col overflow-hidden mb-6"
            >
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Hub AI Assistant</h4>
                    <div className="flex items-center text-[10px] opacity-70">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Online Now
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none text-sm font-medium max-w-[85%]">
                    Hi! I'm your Youth City Hub Assistant. How can I help you grow today?
                  </div>
                </div>
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-2xl text-sm font-medium max-w-[85%] ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-100" : "bg-slate-100 text-slate-800 rounded-tl-none"}`}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask about URA, Passport, Training..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-indigo-600 text-white p-5 rounded-2xl shadow-3xl shadow-indigo-300 flex items-center space-x-3 group"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-indigo-600 rounded-full animate-pulse" />
          </div>
          {!isChatOpen && <span className="font-black text-xs uppercase tracking-widest hidden sm:block">Need Support?</span>}
        </motion.button>
      </div>

    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mail, Linkedin, MapPin, Send, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { IconBlock } from "@/components/ui/IconBlock";
import { PageHero } from "@/components/PageHero";

const africanCountries = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo (Congo-Brazzaville)", "Côte d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Other"
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    subject: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message Sent", {
          description: "Thank you for reaching out. I'll get back to you shortly.",
        });
        setFormData({ name: "", email: "", country: "", subject: "", content: "" });
      } else {
        const errorData = await response.json();
        toast.error("Error", {
          description: errorData.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Contact Us" }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <SiteHeader />

      <PageHero 
        title="Get in touch"
        subtitle="Have a question about MBA applications or consulting careers? I respond to all messages within 24 hours."
        badge="Direct channel"
        breadcrumbs={breadcrumbs}
      />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold mb-6">I'm in your <span className="text-primary">corner.</span></h2>
               <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-6">
                  Whether you're just starting to think about an Oxford MBA or you're days away from a McKinsey interview in Lagos, feel free to reach out. 
               </p>
            </div>

            <div className="space-y-6">
               <div className="flex items-start gap-4 group">
                  <IconBlock icon={Mail} className="w-12 h-12 group-hover:bg-primary group-hover:text-white transition-all duration-500" />
                  <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Email</p>
                     <p className="text-lg font-bold text-foreground">Gathoni.mwai0@gmail.com</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 group">
                  <IconBlock icon={Linkedin} className="w-12 h-12 group-hover:bg-primary group-hover:text-white transition-all duration-500" />
                  <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">LinkedIn</p>
                     <a href="https://www.linkedin.com/in/gathoni-mwai-6747a8118/" className="text-lg font-bold text-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-8">Gathoni Mwai</a>
                  </div>
               </div>

               <div className="flex items-start gap-4 group">
                  <IconBlock icon={MapPin} className="w-12 h-12 group-hover:bg-primary group-hover:text-white transition-all duration-500" />
                  <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Location</p>
                     <p className="text-lg font-bold text-foreground">Oxford, UK (GMT)</p>
                     <p className="text-xs font-medium text-muted-foreground italic">Available across all African time zones.</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-card border border-border rounded-3xl shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <MessageSquare size={100} />
               </div>
               <h4 className="text-xl font-bold mb-3">Looking for a session?</h4>
               <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
                  If you're ready to start your journey, booking a call is the fastest way to get started.
               </p>
               <Link href="/book">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full font-bold text-[11px] h-10">
                     Book now
                  </Button>
               </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border-2 border-border p-8 md:p-12 rounded-3xl shadow-2xl relative">
             <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground ml-4">Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full h-14 bg-secondary/50 border-none rounded-2xl px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        placeholder="Kofi Mensah" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground ml-4">Email</label>
                      <input 
                        type="email" 
                        required
                        className="w-full h-14 bg-secondary/50 border-none rounded-2xl px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                        placeholder="kofi@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-muted-foreground ml-4">Country</label>
                   <select 
                     className="w-full h-14 bg-secondary/50 border-none rounded-2xl px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                     value={formData.country}
                     onChange={(e) => setFormData({...formData, country: e.target.value})}
                   >
                      <option value="" disabled>Select your country</option>
                      {africanCountries.map((country, i) => (
                        <option key={i} value={country.toLowerCase()}>{country}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-muted-foreground ml-4">Subject</label>
                   <input 
                      type="text" 
                      className="w-full h-12 bg-secondary/50 border-none rounded-2xl px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                      placeholder="Inquiry about MBA Coaching" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground ml-4">Message</label>
                   <textarea 
                      rows={6} 
                      required
                      className="w-full bg-secondary/50 border-none rounded-2xl p-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" 
                      placeholder="How can I help you today?" 
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {isSubmitting ? (
                     <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                   ) : (
                     <>Send message <Send size={18} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                   )}
                </Button>

                <p className="text-center text-xs text-muted-foreground font-medium italic">
                   All submissions are secure and strictly confidential.
                </p>
             </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

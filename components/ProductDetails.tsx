import * as React from "react";
import { ShieldCheck, Cpu, Utensils, Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";

/**
 * Product Details Section
 * 
 * FOR STUDENTS:
 * This section satisfies the navigation jump link `#product-details`.
 * It showcases the unique selling points and technological quality standards of Neon Bites products.
 */
export function ProductDetails() {
  const features = [
    {
      icon: <Cpu className="w-8 h-8 text-neon-green" />,
      title: "Molecular Infusion Tech",
      description: "Our flavor compounds are scientifically calibrated using low-temperature vacuum infusion to ensure explosive taste in every single bite.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-neon-green" />,
      title: "Bioluminescent Glazes",
      description: "100% natural plant-based glowing glazes derived from organic riboflavin and spirulina extracts that light up under UV and blue light.",
    },
    {
      icon: <Utensils className="w-8 h-8 text-neon-green" />,
      title: "Artisanal Craftsmanship",
      description: "Hand-smashed patties, scratch-made broths, and fresh daily brioche buns paired with cyberpunk precision.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-neon-green" />,
      title: "Zero Artificial Preservatives",
      description: "We never compromise on health. Our vibrant aesthetics come entirely from nutrient-dense superfoods and natural botanicals.",
    },
  ];

  return (
    <section id="product-details" className="py-20 bg-neon-surface/30 relative scroll-mt-20 border-y border-neon-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-neon-green text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-neon-green/30 bg-neon-green/5 mb-4">
            Quality Breakdown
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            PRODUCT <span className="text-neon-green">DETAILS</span> & SPECIFICATIONS
          </h2>
          <p className="text-gray-400 mt-4 text-base sm:text-lg">
            What makes Neon Bites different? We engineer gastronomy at the intersection of culinary science and immersive cyberpunk culture.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, index) => (
            <Card key={index} className="bg-neon-dark/60 border-neon-border hover:border-neon-green/50 p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="p-4 rounded-2xl bg-neon-green/10 border border-neon-green/30 shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                  {feat.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Interactive Banner inside Product Details */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-neon-green/20 via-neon-dark to-emerald-900/40 border border-neon-green/40 shadow-neon-glow flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-white">Want to customize your flavor profile?</h4>
            <p className="text-gray-300 mt-2 max-w-xl text-sm sm:text-base">
              Speak with our flavor architects to adjust spice frequencies and glaze luminescence for your private events.
            </p>
          </div>
          <a href="#contact-us" className="shrink-0">
            <span className="inline-block px-8 py-3 rounded-full bg-neon-green text-neon-dark font-extrabold shadow-neon-glow hover:bg-emerald-400 transition-all">
              Request Custom Specs
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}

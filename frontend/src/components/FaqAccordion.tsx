"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FAQItem[];
  className?: string;
}

export function FaqAccordion({ faqs, className = "" }: FaqAccordionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {faqs.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-2 border-border rounded-[32px] overflow-hidden bg-card hover:border-primary/20 transition-all px-8 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-xl font-bold py-6 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-6 bg-background/50 rounded-2xl text-lg text-muted-foreground font-medium leading-relaxed border-l-4 border-primary italic mb-4">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12 text-muted-foreground font-medium italic border border-dashed rounded-3xl">
          No FAQs available at the moment.
        </div>
      )}
    </div>
  );
}

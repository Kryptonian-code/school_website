import ScrollReveal from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteContent } from "@/contexts/SiteContentContext";

const FaqSection = () => {
  const { data } = useSiteContent();
  const faqs = data?.faqs ?? [];

  return (
    <section id="faq" className="section-padding bg-background">
      <div className="section-container max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Frequently Asked Questions</p>
            <h2 className="section-title">Answers for Prospective Families</h2>
            <p className="section-subtitle mx-auto">
              Everything you need to know about admissions, academics, and the school experience.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                <AccordionTrigger className="text-left font-heading text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
            {faqs.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                FAQs will appear here once they are published from the admin dashboard.
              </div>
            )}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FaqSection;

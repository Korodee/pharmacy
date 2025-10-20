import HeroSection from '@/components/hero/HeroSection';
import StatementSection from '@/components/statement/StatementSection';
import HowItWorksSection from '@/components/how-it-works/HowItWorksSection';
import ServicesSection from '@/components/services/ServicesSection';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import FAQSection from '@/components/faq/FAQSection';
import CTASection from '@/components/cta/CTASection';
import Footer from '@/components/footer/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StatementSection />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}

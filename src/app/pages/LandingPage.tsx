import { Link } from '@/lib/router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Brain, Lock, Wind, Check, Twitter } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { SEOHead } from '../components/SEOHead';
import { motion } from 'motion/react';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Tea ☕ — Private AI Journaling for Mental Wellbeing"
        description="A place to spill your tea. Your private AI journal for venting about people in your life. Talk freely, be heard deeply, and breathe easier."
      />
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-semibold text-xl">Tea</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                A place to spill your tea 🫖
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your private AI journal for venting about the people in your life. 
                Talk freely, be heard deeply, and breathe easier.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    Start Venting (Free)
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  See How It Works
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why people love Tea
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Lock className="w-8 h-8" />}
                title="Private person chats"
                description="Create separate spaces for each person in your life. Your boss, your ex, that annoying neighbor — all kept private and organized."
              />
              <FeatureCard
                icon={<Brain className="w-8 h-8" />}
                title="AI that actually listens"
                description="Our AI remembers what you've shared, validates your feelings, and responds with real empathy — not generic platitudes."
              />
              <FeatureCard
                icon={<Wind className="w-8 h-8" />}
                title="Breathing tools when it's too much"
                description="Feeling overwhelmed? Access instant calming exercises, breathing guides, and grounding techniques right when you need them."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How it works
            </h2>
            <div className="space-y-12">
              <StepCard
                number={1}
                title="Create a person"
                description="Add someone who's been on your mind. Give them a name and pick an emoji — that's it."
              />
              <StepCard
                number={2}
                title="Vent freely"
                description="Write or type everything you're feeling. No judgment, no limits, completely private."
              />
              <StepCard
                number={3}
                title="AI responds with memory"
                description="Get thoughtful responses that reference your history together. Feel truly heard and understood."
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What people are saying
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Finally, a place where I can actually process my work frustrations without dumping on my partner."
                author="Sarah M."
              />
              <TestimonialCard
                quote="The AI remembers details from months ago. It's like talking to a therapist who never forgets."
                author="Alex K."
              />
              <TestimonialCard
                quote="The breathing exercises saved me during a panic attack. Having them built in is genius."
                author="Jordan L."
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Simple, honest pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PricingCard
                name="Free"
                price="$0"
                period="forever"
                features={[
                  "3 person chats",
                  "Limited AI memory (last 30 days)",
                  "Basic breathing tools",
                  "Full privacy protection"
                ]}
                cta="Start Free"
                ctaLink="/signup"
              />
              <PricingCard
                name="Pro"
                price="$5"
                period="per month"
                features={[
                  "Unlimited person chats",
                  "Full AI memory (unlimited history)",
                  "Priority AI responses",
                  "Advanced calming tools",
                  "Export your data anytime"
                ]}
                cta="Start Free Trial"
                ctaLink="/signup"
                highlighted
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <span className="font-semibold text-xl">Tea</span>
              </div>
              <nav className="flex flex-wrap gap-6 justify-center">
                <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="mailto:hello@tea.app" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </nav>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/teajournal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="text-center mt-8 text-sm text-muted-foreground">
              © 2026 Tea. Made with care for your mental wellbeing.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex gap-6"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>
    </motion.div>
  );
}

function TestimonialCard({ quote, author }: { quote: string; author: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 h-full">
        <p className="text-lg mb-4 italic">"{quote}"</p>
        <p className="font-medium">— {author}</p>
      </Card>
    </motion.div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-8 h-full flex flex-col ${highlighted ? 'border-primary border-2 shadow-lg' : ''}`}>
        {highlighted && (
          <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to={ctaLink}>
          <Button className="w-full" variant={highlighted ? 'default' : 'outline'} size="lg">
            {cta}
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}

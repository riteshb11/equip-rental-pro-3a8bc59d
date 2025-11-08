import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { AIChatBot } from "@/components/AIChatBot";
import { Link } from "react-router-dom";
import { Tractor, Shield, Clock, MessageSquare, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        <div className="relative z-10 container text-center text-primary-foreground px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Krishi Setu
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Your trusted marketplace for farm equipment rentals. Connect farmers and customers seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="shadow-lg">
              <Link to="/equipment">
                Browse Equipment <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose Krishi Setu?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We make farm equipment rental simple, secure, and efficient for everyone
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-soft hover:shadow-strong transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Tractor className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Wide Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Tractors, rotavators, cultivators, threshers, and more
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-strong transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Secure Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Safe payment options and verified equipment owners
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-strong transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Real-time Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Check equipment availability instantly with our calendar
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-strong transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">AI Crop Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant farming advice powered by AI
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Join thousands of farmers and customers using Krishi Setu for their equipment needs
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link to="/auth?mode=signup">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Krishi Setu. Empowering farmers with technology.</p>
        </div>
      </footer>

      <AIChatBot />
    </div>
  );
};

export default Index;

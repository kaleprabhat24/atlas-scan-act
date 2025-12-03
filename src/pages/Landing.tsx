import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scan, Map, FileText, ArrowRight, Leaf, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Landing = () => {
  const [mapPreviewLoaded, setMapPreviewLoaded] = useState(false);

  const features = [
    {
      icon: Scan,
      title: "Scan Documents",
      description: "Upload forest rights documents and extract data using advanced OCR technology. Supports images and PDFs with automatic text recognition.",
      color: "text-primary"
    },
    {
      icon: Map,
      title: "Map Claims",
      description: "Visualize all claims on an interactive map with clustering, risk overlays, and district-wise analytics for better decision making.",
      color: "text-accent"
    },
    {
      icon: FileText,
      title: "Act on Data",
      description: "Generate QR codes, get automated scheme suggestions, and track approval workflows with built-in decision support systems.",
      color: "text-success"
    }
  ];

  const stats = [
    { icon: Users, label: "Claims Processed", value: "2,847", color: "text-primary" },
    { icon: TrendingUp, label: "Approval Rate", value: "73.2%", color: "text-success" },
    { icon: Map, label: "Districts Covered", value: "156", color: "text-accent" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FRA Atlas</h1>
              <p className="text-xs text-muted-foreground">Scan • Map • Act</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link to="/map" className="text-sm hover:text-primary transition-colors">View Map</Link>
            <Link to="/admin" className="text-sm hover:text-primary transition-colors">Admin</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forest Rights Atlas
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Digitize forest rights claims with intelligent OCR scanning, interactive mapping, 
            and automated decision support systems.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/upload">
              <Button className="btn-hero text-lg px-8 py-4">
                Try Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="outline" className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Map
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="card-elevated overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
              {!mapPreviewLoaded && (
                <div className="text-center">
                  <Map className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive Map Preview</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "View Map" to see live forest rights claims</p>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Link to="/map">
                  <Button variant="secondary" size="sm">
                    Open Full Map
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How FRA Atlas Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple 3-step process to digitize and manage forest rights claims
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="feature-card group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300 ${feature.color}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Learn more <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forest departments and NGOs using FRA Atlas to streamline forest rights claim processing.
          </p>
          <Link to="/upload">
            <Button className="btn-hero text-lg px-8 py-4">
              Start Processing Claims
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">
                © 2024 FRA Atlas. Built for forest rights management.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
              <Link to="/map" className="hover:text-primary transition-colors">Map View</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
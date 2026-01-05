import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// TikTok icon component
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Mock newsletter signup
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-heading text-xl font-bold">MN</span>
              </div>
              <div>
                <div className="font-heading text-lg font-semibold">Mother Natural</div>
                <div className="text-xs text-muted-foreground">The Healing Lab</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Nurturing wellness through nature's healing power. Join us on your journey to holistic health.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://www.instagram.com/mothernaturalthehealinglab" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-pink-500">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a 
                href="https://www.tiktok.com/@mothernaturalthehealer" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-black">
                  <TikTokIcon className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shop</Link></li>
              <li><Link to="/appointments" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book Appointment</Link></li>
              <li><Link to="/classes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Classes</Link></li>
              <li><Link to="/retreats" className="text-sm text-muted-foreground hover:text-primary transition-colors">Retreats</Link></li>
              <li><Link to="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:Mothernaturalcontact@gmail.com" className="hover:text-primary transition-colors">
                  Mothernaturalcontact@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Suffolk County, New York</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive wellness tips and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                required
                className="bg-background"
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mother Natural: The Healing Lab. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-accent fill-accent" />
            <span>for your wellness journey</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

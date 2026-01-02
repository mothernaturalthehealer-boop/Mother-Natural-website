import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = getCartCount();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-heading text-xl font-bold">MN</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-heading text-lg font-semibold text-foreground">Mother Natural</div>
              <div className="text-xs text-muted-foreground">The Healing Lab</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/shop">
                    <NavigationMenuLink className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Shop
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <Link to="/appointments" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                        Book Appointment
                      </Link>
                      <Link to="/classes" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                        Classes
                      </Link>
                      <Link to="/retreats" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                        Retreats
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/community">
                    <NavigationMenuLink className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Community
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-48 p-2">
                        <div className="px-4 py-2 text-sm font-medium border-b border-border mb-2">
                          {user.name}
                        </div>
                        <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <Button onClick={() => navigate('/login')} variant="outline" size="sm">
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                    Shop
                  </Link>
                  <Link to="/appointments" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                    Appointments
                  </Link>
                  <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                    Classes
                  </Link>
                  <Link to="/retreats" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                    Retreats
                  </Link>
                  <Link to="/community" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                    Community
                  </Link>
                  {user && (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

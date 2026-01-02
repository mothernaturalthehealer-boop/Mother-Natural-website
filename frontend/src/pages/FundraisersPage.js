import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Users, Calendar, DollarSign, Target } from 'lucide-react';

export const FundraisersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fundraisers, setFundraisers] = useState([]);
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    // Load fundraisers from localStorage
    const savedFundraisers = localStorage.getItem('fundraisers');
    if (savedFundraisers) {
      setFundraisers(JSON.parse(savedFundraisers));
    } else {
      // Default fundraisers
      const defaultFundraisers = [
        {
          id: 1,
          title: 'Support Sarah\'s Healing Journey',
          beneficiary: 'Sarah Johnson',
          story: 'Sarah is a beloved member of our community who needs support for her holistic cancer treatment journey. Your contribution will help cover natural medicine, energy healing sessions, and wellness therapies.',
          goalAmount: 5000,
          raisedAmount: 2350,
          image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          createdDate: '2024-01-15',
          endDate: '2024-03-15',
          status: 'active',
          contributors: 47
        },
        {
          id: 2,
          title: 'Help Jennifer Attend Retreat',
          beneficiary: 'Jennifer Martinez',
          story: 'Jennifer is going through a difficult time after loss and needs the healing power of our Mountain Meditation Retreat. This fundraiser will cover her retreat costs and travel expenses.',
          goalAmount: 1500,
          raisedAmount: 1200,
          image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          createdDate: '2024-02-01',
          endDate: '2024-02-28',
          status: 'active',
          contributors: 28
        },
        {
          id: 3,
          title: 'Emergency Support for Lisa',
          beneficiary: 'Lisa Anderson',
          story: 'Lisa faces unexpected medical expenses and needs our community\'s support. Funds will help with natural treatment costs, healing sessions, and essential wellness products.',
          goalAmount: 3000,
          raisedAmount: 850,
          image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
          createdDate: '2024-01-28',
          endDate: '2024-03-28',
          status: 'active',
          contributors: 19
        }
      ];
      localStorage.setItem('fundraisers', JSON.stringify(defaultFundraisers));
      setFundraisers(defaultFundraisers);
    }
  }, []);

  const handleContribute = (fundraiser) => {
    if (!user) {
      toast.error('Please login to contribute');
      navigate('/login');
      return;
    }
    setSelectedFundraiser(fundraiser);
    setContributionAmount('');
    setShowContributeDialog(true);
  };

  const submitContribution = () => {
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Update fundraiser with new amount
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === selectedFundraiser.id) {
        return {
          ...f,
          raisedAmount: f.raisedAmount + amount,
          contributors: f.contributors + 1
        };
      }
      return f;
    });

    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));

    toast.success(`Thank you for contributing $${amount.toFixed(2)} to ${selectedFundraiser.beneficiary}!`);
    setShowContributeDialog(false);
    setSelectedFundraiser(null);
    setContributionAmount('');
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const activeFundraisers = fundraisers.filter(f => f.status === 'active');

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-accent fill-accent mr-3" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">Community Fundraisers</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support our community members in their times of need. Every contribution makes a difference.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-primary border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Fundraisers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeFundraisers.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-secondary border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-foreground opacity-90">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary-foreground">
                ${activeFundraisers.reduce((sum, f) => sum + f.raisedAmount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-accent-foreground opacity-90">Community Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {activeFundraisers.reduce((sum, f) => sum + f.contributors, 0)} contributors
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fundraisers Grid */}
        {activeFundraisers.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg text-muted-foreground">No active fundraisers at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeFundraisers.map((fundraiser) => {
              const progress = calculateProgress(fundraiser.raisedAmount, fundraiser.goalAmount);
              const daysRemaining = getDaysRemaining(fundraiser.endDate);

              return (
                <Card key={fundraiser.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={fundraiser.image}
                      alt={fundraiser.beneficiary}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-heading text-xl font-bold text-white mb-1">
                        {fundraiser.beneficiary}
                      </h3>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                        <Users className="h-3 w-3 mr-1" />
                        {fundraiser.contributors} contributors
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="flex-grow">
                    <CardTitle className="font-heading text-lg">{fundraiser.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-sm">
                      {fundraiser.story}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-primary">
                          ${fundraiser.raisedAmount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          of ${fundraiser.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(0)}% funded</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {daysRemaining} days left
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleContribute(fundraiser)}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Contribute Now
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* How It Helps Section */}
        <Card className="mt-12 bg-muted/30">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">How Your Contribution Helps</CardTitle>
            <CardDescription>Every dollar directly supports community members in need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">100% Direct Support</h4>
                <p className="text-sm text-muted-foreground">
                  All contributions go directly to the beneficiary with no platform fees
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">Community Verified</h4>
                <p className="text-sm text-muted-foreground">
                  Each fundraiser is reviewed and verified by our community moderators
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-semibold mb-2">Transparent Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Beneficiaries share updates on how funds are helping their healing journey
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Support {selectedFundraiser?.beneficiary}</DialogTitle>
            <DialogDescription>
              {selectedFundraiser?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="pl-9"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setContributionAmount(amount.toString())}
                  className="hover:bg-primary/10 hover:border-primary"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {selectedFundraiser && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Progress:</span>
                  <span className="font-semibold">
                    ${selectedFundraiser.raisedAmount.toLocaleString()} / ${selectedFundraiser.goalAmount.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(selectedFundraiser.raisedAmount, selectedFundraiser.goalAmount)} 
                  className="h-2" 
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContributeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitContribution} className="bg-accent hover:bg-accent/90">
              <Heart className="mr-2 h-4 w-4" />
              Contribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

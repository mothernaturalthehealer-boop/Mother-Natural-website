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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Heart, Users, Calendar, DollarSign, Target, Plus, Clock } from 'lucide-react';

export const FundraisersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fundraisers, setFundraisers] = useState([]);
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [newApplication, setNewApplication] = useState({
    title: '',
    beneficiary: '',
    story: '',
    goalAmount: '',
    image: '',
    endDate: ''
  });

  useEffect(() => {
    // Load fundraisers from localStorage - only show active ones to public
    const savedFundraisers = localStorage.getItem('fundraisers');
    if (savedFundraisers) {
      const all = JSON.parse(savedFundraisers);
      // Filter to only show active fundraisers to the public
      setFundraisers(all.filter(f => f.status === 'active'));
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
    const allFundraisers = JSON.parse(localStorage.getItem('fundraisers') || '[]');
    const updatedFundraisers = allFundraisers.map(f => {
      if (f.id === selectedFundraiser.id) {
        return {
          ...f,
          raisedAmount: (f.raisedAmount || 0) + amount,
          contributors: (f.contributors || 0) + 1
        };
      }
      return f;
    });
    
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    setFundraisers(updatedFundraisers.filter(f => f.status === 'active'));
    
    toast.success(`Thank you for your contribution of $${amount}!`);
    setShowContributeDialog(false);
    setContributionAmount('');
    setSelectedFundraiser(null);
  };

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply for a fundraiser');
      navigate('/login');
      return;
    }
    setShowApplyDialog(true);
  };

  const submitApplication = () => {
    if (!newApplication.title || !newApplication.beneficiary || !newApplication.goalAmount || !newApplication.story) {
      toast.error('Please fill in all required fields');
      return;
    }

    const application = {
      id: Date.now(),
      title: newApplication.title,
      beneficiary: newApplication.beneficiary,
      story: newApplication.story,
      goalAmount: parseFloat(newApplication.goalAmount),
      raisedAmount: 0,
      image: newApplication.image || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      createdDate: new Date().toISOString().split('T')[0],
      endDate: newApplication.endDate,
      status: 'pending', // Pending admin approval
      contributors: 0,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email
    };

    const allFundraisers = JSON.parse(localStorage.getItem('fundraisers') || '[]');
    allFundraisers.push(application);
    localStorage.setItem('fundraisers', JSON.stringify(allFundraisers));
    
    toast.success('Your fundraiser application has been submitted! It will be visible once approved by admin.');
    setShowApplyDialog(false);
    setNewApplication({
      title: '',
      beneficiary: '',
      story: '',
      goalAmount: '',
      image: '',
      endDate: ''
    });
  };

  const getProgressPercentage = (raised, goal) => {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Community Fundraisers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Support members of our healing community who need our collective love and assistance
          </p>
          <Button 
            onClick={handleApply}
            className="bg-primary hover:bg-primary-dark"
            data-testid="apply-fundraiser-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply for a Fundraiser
          </Button>
        </div>

        {/* Fundraisers Grid */}
        {fundraisers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundraisers.map((fundraiser) => (
              <Card key={fundraiser.id} className="overflow-hidden hover:shadow-elegant transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={fundraiser.image}
                    alt={fundraiser.beneficiary}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-primary">
                    <Heart className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="font-heading text-xl">{fundraiser.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    For {fundraiser.beneficiary}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {fundraiser.story}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">
                        ${(fundraiser.raisedAmount || 0).toLocaleString()} raised
                      </span>
                      <span className="text-muted-foreground">
                        of ${fundraiser.goalAmount.toLocaleString()} goal
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(fundraiser.raisedAmount || 0, fundraiser.goalAmount)} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {fundraiser.contributors || 0} contributors
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Ends {fundraiser.endDate}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark"
                    onClick={() => handleContribute(fundraiser)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Contribute Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Fundraisers</h3>
            <p className="text-muted-foreground mb-6">
              There are currently no active fundraisers. Be the first to apply!
            </p>
            <Button onClick={handleApply} className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Apply for a Fundraiser
            </Button>
          </div>
        )}

        {/* Contribute Dialog */}
        <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Make a Contribution</DialogTitle>
              <DialogDescription>
                Support {selectedFundraiser?.beneficiary}'s healing journey
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold">{selectedFundraiser?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(selectedFundraiser?.raisedAmount || 0).toLocaleString()} of ${selectedFundraiser?.goalAmount.toLocaleString()} raised
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Contribution Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setContributionAmount(amount.toString())}
                    className="flex-1"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowContributeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitContribution} className="bg-primary hover:bg-primary-dark">
                <Heart className="mr-2 h-4 w-4" />
                Contribute ${contributionAmount || '0'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply for Fundraiser Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Apply for a Fundraiser</DialogTitle>
              <DialogDescription>
                Submit your fundraiser application. It will be reviewed by our admin team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <Clock className="h-4 w-4 inline mr-2" />
                Your application will be reviewed and must be approved by admin before it becomes visible to the community.
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Fundraiser Title *</Label>
                <Input
                  id="title"
                  value={newApplication.title}
                  onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
                  placeholder="e.g., Support Sarah's Healing Journey"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary Name *</Label>
                <Input
                  id="beneficiary"
                  value={newApplication.beneficiary}
                  onChange={(e) => setNewApplication({ ...newApplication, beneficiary: e.target.value })}
                  placeholder="Who will receive the funds?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    min="1"
                    value={newApplication.goalAmount}
                    onChange={(e) => setNewApplication({ ...newApplication, goalAmount: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newApplication.endDate}
                    onChange={(e) => setNewApplication({ ...newApplication, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="story">Story/Description *</Label>
                <Textarea
                  id="story"
                  value={newApplication.story}
                  onChange={(e) => setNewApplication({ ...newApplication, story: e.target.value })}
                  placeholder="Share the beneficiary's story and how the funds will help..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  value={newApplication.image}
                  onChange={(e) => setNewApplication({ ...newApplication, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Paste a URL to an image for your fundraiser</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitApplication} className="bg-primary hover:bg-primary-dark">
                <Target className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

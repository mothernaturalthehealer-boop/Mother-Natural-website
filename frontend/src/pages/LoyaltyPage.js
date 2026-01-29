import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Sparkles, Gift, Users, ShoppingBag, Share2, Copy, Check, 
  Droplets, Leaf, Sun, Trophy, Clock, ArrowRight, Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Tier colors and icons
const tierStyles = {
  seed: { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', icon: '🌱' },
  root: { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', icon: '🌿' },
  bloom: { color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-300', icon: '🌸' },
  divine: { color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300', icon: '✨' }
};

export const LoyaltyPage = () => {
  const { user, getAuthHeaders, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showStartGame, setShowStartGame] = useState(false);
  const [rewards, setRewards] = useState({ products: [], services: [], classes: [] });
  const [selectedReward, setSelectedReward] = useState({ type: '', id: '', name: '' });
  const [targetDays, setTargetDays] = useState(14);
  const [waterCooldown, setWaterCooldown] = useState(0);
  const [isWatering, setIsWatering] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Load loyalty stats
      const statsRes = await fetch(`${API_URL}/api/loyalty/user-stats`, {
        headers: getAuthHeaders()
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load plant game
      const gameRes = await fetch(`${API_URL}/api/game/plant`, {
        headers: getAuthHeaders()
      });
      if (gameRes.ok) {
        const gameData = await gameRes.json();
        setGame(gameData);
        if (gameData?.timeUntilWater > 0) {
          setWaterCooldown(gameData.timeUntilWater);
        }
      }

      // Load available rewards
      const [productsRes, servicesRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/classes`)
      ]);
      
      const products = productsRes.ok ? await productsRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const classes = classesRes.ok ? await classesRes.json() : [];
      
      setRewards({ products, services, classes });
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, [user, getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cooldown timer
  useEffect(() => {
    if (waterCooldown > 0) {
      const timer = setInterval(() => {
        setWaterCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [waterCooldown]);

  const generateReferralCode = async () => {
    try {
      const res = await fetch(`${API_URL}/api/loyalty/generate-referral-code`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (refreshUser) await refreshUser();
        loadData();
        toast.success('Referral code generated!');
      }
    } catch (error) {
      toast.error('Failed to generate code');
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  const startGame = async () => {
    if (!selectedReward.type || !selectedReward.id) {
      toast.error('Please select a reward');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/game/plant/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          rewardType: selectedReward.type,
          rewardId: selectedReward.id,
          rewardName: selectedReward.name,
          targetDays: targetDays
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGame(data.game);
        setShowStartGame(false);
        toast.success('Your plant journey has begun! 🌱');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to start game');
      }
    } catch (error) {
      toast.error('Failed to start game');
    }
  };

  const waterPlant = async () => {
    if (isWatering || waterCooldown > 0) return;
    
    setIsWatering(true);
    try {
      const res = await fetch(`${API_URL}/api/game/plant/water`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setGame(prev => ({
          ...prev,
          growthPercentage: data.newGrowth,
          waterCount: (prev?.waterCount || 0) + 1,
          canWater: false,
          isComplete: data.isComplete
        }));
        setWaterCooldown(4 * 60 * 60); // 4 hours in seconds
        
        if (data.isComplete) {
          toast.success(data.message, { duration: 5000 });
        } else {
          toast.success(`+${data.growthAdded}% growth! 💧`);
        }
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Cannot water yet');
      }
    } catch (error) {
      toast.error('Failed to water plant');
    }
    setIsWatering(false);
  };

  const shareGameLink = () => {
    const link = `${window.location.origin}/support-garden?helper=${user?.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied! When friends visit, your plant gets food! 🌿');
  };

  const formatCooldown = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-2">Join Our Loyalty Program</h2>
            <p className="text-muted-foreground mb-4">Login to access rewards, earn points, and grow your healing journey!</p>
            <Button onClick={() => navigate('/login')} className="bg-primary">Login to Continue</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentTier = stats?.currentTier || { id: 'seed', name: 'Seed', title: 'Sacred Initiate' };
  const tierStyle = tierStyles[currentTier.id] || tierStyles.seed;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-green-50/50 to-background">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Your Healing Journey</h1>
          <p className="text-lg text-muted-foreground">
            Earn rewards, grow your spirit, and nurture your wellness path
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Membership & Points */}
          <div className="space-y-6">
            {/* Current Tier Card */}
            <Card className={`border-2 ${tierStyle.border} overflow-hidden`}>
              <div className={`${tierStyle.bg} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                    <h2 className={`text-3xl font-heading font-bold ${tierStyle.color}`}>
                      {tierStyle.icon} {currentTier.name}
                    </h2>
                    <p className={`text-lg ${tierStyle.color}`}>{currentTier.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{stats?.loyaltyPoints || 0}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">&quot;{currentTier.tagline}&quot;</p>
                <p className="text-sm">{currentTier.description}</p>
                
                {stats?.nextTier && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to {stats.nextTier.name}</span>
                      <span className="font-medium">{stats.pointsToNextTier} points to go</span>
                    </div>
                    <Progress value={stats.progressToNextTier} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats?.orderCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats?.referralCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Referrals</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Refer Friends, Earn Rewards
                </CardTitle>
                <CardDescription>Share your unique link and earn 100 points when friends join!</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.referralCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm font-mono">{stats.referralCode}</code>
                      <Button size="sm" variant="outline" onClick={copyReferralLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button className="w-full" variant="outline" onClick={copyReferralLink}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Referral Link
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-primary" onClick={generateReferralCode}>
                    Generate My Referral Code
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Ways to Earn */}
            <Card>
              <CardHeader>
                <CardTitle>Ways to Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <span>Make a Purchase</span>
                  </div>
                  <Badge variant="secondary">1 pt / $1</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Refer a Friend</span>
                  </div>
                  <Badge variant="secondary">100 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span>Daily Sign-in</span>
                  </div>
                  <Badge variant="secondary">5 pts</Badge>
                </div>
              </CardContent>
            </Card>

            {/* All Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.allTiers?.map((tier, idx) => {
                  const style = tierStyles[tier.id] || tierStyles.seed;
                  const isCurrentTier = tier.id === currentTier.id;
                  return (
                    <div 
                      key={tier.id} 
                      className={`p-4 rounded-lg border-2 ${isCurrentTier ? style.border + ' ' + style.bg : 'border-muted'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{style.icon}</span>
                          <span className={`font-semibold ${isCurrentTier ? style.color : ''}`}>
                            {tier.name} | {tier.title}
                          </span>
                        </div>
                        <Badge variant={isCurrentTier ? 'default' : 'outline'}>
                          {tier.pointsRequired} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic">&quot;{tier.tagline}&quot;</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Plant Game */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-2 border-green-200">
              <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 p-8 min-h-[300px] relative">
                {/* Sun */}
                <div className="absolute top-4 right-4">
                  <Sun className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
                </div>
                
                {/* Plant visualization */}
                <div className="flex flex-col items-center justify-end h-full">
                  {game && !game.isComplete && !game.isExpired ? (
                    <>
                      {/* Growing plant */}
                      <div className="relative">
                        <div 
                          className="text-center transition-all duration-500"
                          style={{ 
                            transform: `scale(${0.5 + (game.growthPercentage / 100) * 1.5})`,
                            opacity: 0.5 + (game.growthPercentage / 100) * 0.5
                          }}
                        >
                          {game.growthPercentage < 25 && <span className="text-6xl">🌱</span>}
                          {game.growthPercentage >= 25 && game.growthPercentage < 50 && <span className="text-6xl">🌿</span>}
                          {game.growthPercentage >= 50 && game.growthPercentage < 75 && <span className="text-6xl">🪴</span>}
                          {game.growthPercentage >= 75 && game.growthPercentage < 100 && <span className="text-6xl">🌳</span>}
                          {game.growthPercentage >= 100 && <span className="text-6xl">🌸</span>}
                        </div>
                      </div>
                      
                      {/* Soil */}
                      <div className="w-32 h-8 bg-amber-800 rounded-t-full mt-2" />
                      
                      {/* Growth progress */}
                      <div className="mt-4 text-center">
                        <p className="text-2xl font-bold text-green-800">{Math.round(game.growthPercentage)}%</p>
                        <p className="text-sm text-green-700">Growth</p>
                      </div>
                    </>
                  ) : game?.isComplete ? (
                    <div className="text-center">
                      <span className="text-8xl">🌸</span>
                      <Trophy className="h-12 w-12 text-yellow-500 mx-auto mt-4" />
                      <p className="text-xl font-bold text-green-800 mt-2">Fully Grown!</p>
                      <p className="text-green-600">You won: {game.rewardName}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Leaf className="h-16 w-16 text-green-400 mx-auto opacity-50" />
                      <p className="text-muted-foreground mt-4">Start growing your plant!</p>
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="pt-6">
                <CardTitle className="flex items-center gap-2 mb-4">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Healing Garden Game
                </CardTitle>
                
                {game && !game.isComplete && !game.isExpired ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Goal:</strong> Grow your plant to 100% to win<br />
                        <span className="text-green-600 font-medium">{game.rewardName}</span>
                      </p>
                    </div>
                    
                    <Progress value={game.growthPercentage} className="h-4" />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                        <p className="text-lg font-bold">{game.waterCount}</p>
                        <p className="text-xs text-muted-foreground">Times Watered</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Leaf className="h-5 w-5 mx-auto text-green-500 mb-1" />
                        <p className="text-lg font-bold">{game.plantFood}</p>
                        <p className="text-xs text-muted-foreground">Plant Food</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                        onClick={waterPlant}
                        disabled={isWatering || waterCooldown > 0}
                        data-testid="water-plant-btn"
                      >
                        {waterCooldown > 0 ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            {formatCooldown(waterCooldown)}
                          </>
                        ) : (
                          <>
                            <Droplets className="h-4 w-4 mr-2" />
                            Water Plant
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={shareGameLink}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share for Food
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Days remaining: {Math.max(0, Math.ceil((new Date(game.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                    </p>
                  </div>
                ) : game?.isComplete ? (
                  <div className="text-center space-y-4">
                    <p className="text-green-600 font-medium">
                      Congratulations! Visit the shop or contact us to claim your reward.
                    </p>
                    <Button onClick={() => setShowStartGame(true)} className="bg-green-600">
                      Start New Game
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Choose a reward you want to win, then grow your plant to 100% by watering it daily and sharing with friends!
                    </p>
                    <Button onClick={() => setShowStartGame(true)} className="bg-green-600" data-testid="start-game-btn">
                      <Leaf className="h-4 w-4 mr-2" />
                      Start Growing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Play */}
            <Card>
              <CardHeader>
                <CardTitle>How to Grow Your Plant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Water Your Plant</p>
                    <p className="text-sm text-muted-foreground">Log in and water every 4 hours (+5% growth)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Share2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Share for Plant Food</p>
                    <p className="text-sm text-muted-foreground">Friends who visit your link add food (+2% growth each)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Make Purchases</p>
                    <p className="text-sm text-muted-foreground">Purchases boost your plant with extra food!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Reach 100% to Win!</p>
                    <p className="text-sm text-muted-foreground">Complete before time runs out to claim your reward</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Start Game Dialog */}
      <Dialog open={showStartGame} onOpenChange={setShowStartGame}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Start Your Healing Garden
            </DialogTitle>
            <DialogDescription>
              Choose the reward you want to grow towards
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reward Type</label>
              <Select 
                value={selectedReward.type} 
                onValueChange={(type) => setSelectedReward({ type, id: '', name: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reward type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedReward.type && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Your Reward</label>
                <Select 
                  value={selectedReward.id}
                  onValueChange={(id) => {
                    const items = rewards[selectedReward.type + 's'] || [];
                    const item = items.find(i => i.id === id);
                    setSelectedReward(prev => ({ ...prev, id, name: item?.name || item?.title || '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your reward" />
                  </SelectTrigger>
                  <SelectContent>
                    {(rewards[selectedReward.type + 's'] || []).map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name || item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Days</label>
              <Select value={String(targetDays)} onValueChange={(v) => setTargetDays(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="21">21 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartGame(false)}>
              Cancel
            </Button>
            <Button onClick={startGame} className="bg-green-600" disabled={!selectedReward.id}>
              <Leaf className="h-4 w-4 mr-2" />
              Plant My Seed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

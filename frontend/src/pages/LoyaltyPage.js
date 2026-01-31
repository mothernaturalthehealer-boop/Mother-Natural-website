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
  Droplets, Leaf, Sun, Trophy, Clock, Star
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
  const [rewards, setRewards] = useState({ products: [], services: [], classes: [], retreats: [] });
  const [selectedReward, setSelectedReward] = useState({ type: '', id: '', name: '' });
  const [rewardTypes, setRewardTypes] = useState([]);
  const [manifestations, setManifestations] = useState([]);
  const [selectedManifestation, setSelectedManifestation] = useState('');
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
      
      // Load reward types and manifestations first
      const [rewardTypesRes, manifestationsRes] = await Promise.all([
        fetch(`${API_URL}/api/game/reward-types`),
        fetch(`${API_URL}/api/game/manifestations`)
      ]);
      
      let loadedManifestations = [];
      let loadedRewardTypes = [];
      
      if (rewardTypesRes.ok) {
        loadedRewardTypes = await rewardTypesRes.json();
        setRewardTypes(loadedRewardTypes);
      }
      if (manifestationsRes.ok) {
        loadedManifestations = await manifestationsRes.json();
        setManifestations(loadedManifestations);
      }
      
      // Process game data and enrich if missing manifestation info
      if (gameRes.ok) {
        let gameData = await gameRes.json();
        
        // If game exists but is missing plant image/type, try to enrich it
        if (gameData && gameData.manifestationId && !gameData.plantImage) {
          const manifestation = loadedManifestations.find(m => m.id === gameData.manifestationId);
          if (manifestation) {
            gameData = {
              ...gameData,
              plantImage: manifestation.plantImage,
              plantType: manifestation.plantType,
              manifestationName: manifestation.name
            };
          }
        }
        
        setGame(gameData);
        if (gameData?.timeUntilWater > 0) {
          setWaterCooldown(gameData.timeUntilWater);
        }
      }

      // Load available rewards
      const [productsRes, servicesRes, classesRes, retreatsRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/classes`),
        fetch(`${API_URL}/api/retreats`)
      ]);
      
      const products = productsRes.ok ? await productsRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const classes = classesRes.ok ? await classesRes.json() : [];
      const retreats = retreatsRes.ok ? await retreatsRes.json() : [];
      
      setRewards({ products, services, classes, retreats });
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
    if (!selectedManifestation) {
      toast.error('Please select a manifestation');
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
          manifestationId: selectedManifestation
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGame(data.game);
        setShowStartGame(false);
        setSelectedReward({ type: '', id: '', name: '' });
        setSelectedManifestation('');
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
              {/* Realistic Garden Background */}
              <div className="relative min-h-[400px] overflow-hidden">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1767493561576-0007c469e9e7?w=800&q=80')`,
                  }}
                />
                {/* Soft overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
                
                {/* Animated light rays from top */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 left-1/4 w-32 h-96 bg-gradient-to-b from-yellow-200/30 to-transparent rotate-12 animate-pulse" style={{ animationDuration: '4s' }} />
                  <div className="absolute -top-20 right-1/4 w-24 h-80 bg-gradient-to-b from-yellow-100/20 to-transparent -rotate-12 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                </div>
                
                {/* Floating particles/fireflies */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-lg animate-pulse"
                      style={{
                        left: `${15 + (i * 10) % 70}%`,
                        top: `${20 + (i * 12) % 50}%`,
                        animationDuration: `${2 + (i % 2)}s`,
                        animationDelay: `${i * 0.4}s`,
                        boxShadow: '0 0 8px 2px rgba(253, 224, 71, 0.6)'
                      }}
                    />
                  ))}
                </div>
                
                {/* Plant visualization */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full pt-6 pb-16">
                  {game && !game.isComplete && !game.isExpired ? (
                    <>
                      {/* Large Plant Image with glow */}
                      <div className="relative mb-4">
                        {game.plantImage ? (
                          <div 
                            className="transition-all duration-700 ease-out"
                            style={{ 
                              transform: `scale(${0.85 + (game.growthPercentage / 100) * 0.35})`,
                            }}
                          >
                            {/* Glow effect behind plant */}
                            <div className="absolute inset-0 bg-green-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
                            <img 
                              src={game.plantImage} 
                              alt={game.plantType || 'Your plant'} 
                              className="w-48 h-48 object-cover rounded-full border-4 border-white/80 shadow-2xl relative z-10"
                              style={{ boxShadow: '0 0 40px rgba(34, 197, 94, 0.4), 0 20px 40px rgba(0,0,0,0.3)' }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="text-center transition-all duration-500"
                            style={{ 
                              transform: `scale(${0.85 + (game.growthPercentage / 100) * 0.5})`,
                            }}
                          >
                            {game.growthPercentage < 25 && <span className="text-8xl drop-shadow-lg">🌱</span>}
                            {game.growthPercentage >= 25 && game.growthPercentage < 50 && <span className="text-8xl drop-shadow-lg">🌿</span>}
                            {game.growthPercentage >= 50 && game.growthPercentage < 75 && <span className="text-8xl drop-shadow-lg">🪴</span>}
                            {game.growthPercentage >= 75 && game.growthPercentage < 100 && <span className="text-8xl drop-shadow-lg">🌳</span>}
                            {game.growthPercentage >= 100 && <span className="text-8xl drop-shadow-lg">🌸</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Plant name and manifestation - on glass card */}
                      <div className="text-center mb-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        {game.plantType && (
                          <p className="text-lg font-bold text-white drop-shadow-lg">{game.plantType}</p>
                        )}
                        {game.manifestationName && (
                          <p className="text-sm text-green-100 font-medium">✨ {game.manifestationName}</p>
                        )}
                      </div>
                      
                      {/* Growth Percentage - Large Display on glass */}
                      <div className="text-center px-8 py-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/40">
                        <p className="text-5xl font-bold text-white drop-shadow-lg">{Math.round(game.growthPercentage)}%</p>
                        <p className="text-sm text-green-100">Growth Progress</p>
                      </div>
                    </>
                  ) : game?.isComplete ? (
                    <div className="text-center">
                      {/* Celebration effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full animate-ping"
                            style={{
                              left: `${10 + ((i * 17) % 80)}%`,
                              top: `${10 + ((i * 23) % 70)}%`,
                              backgroundColor: ['#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#a78bfa'][i % 5],
                              animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                              animationDelay: `${(i % 5) * 0.4}s`
                            }}
                          />
                        ))}
                      </div>
                      {game.plantImage ? (
                        <img 
                          src={game.plantImage} 
                          alt={game.plantType || 'Your plant'} 
                          className="w-44 h-44 object-cover rounded-full border-4 border-yellow-400 shadow-2xl mx-auto"
                          style={{ boxShadow: '0 0 60px rgba(251, 191, 36, 0.6)' }}
                        />
                      ) : (
                        <span className="text-8xl">🌸</span>
                      )}
                      <Trophy className="h-16 w-16 text-yellow-400 mx-auto mt-4 drop-shadow-lg" />
                      <div className="mt-4 px-6 py-3 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 inline-block">
                        <p className="text-2xl font-bold text-white drop-shadow-lg">Fully Grown!</p>
                        <p className="text-lg text-green-100">You won: {game.rewardName}</p>
                      </div>
                    </div>
                  ) : (
                    /* No Active Game - Realistic Garden Start Screen */
                    <div className="text-center relative">
                      {/* Floating seed/leaf animation */}
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-green-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '2.5s' }} />
                        <div className="animate-bounce" style={{ animationDuration: '3s' }}>
                          <Leaf className="h-28 w-28 text-green-400 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(74, 222, 128, 0.5))' }} />
                        </div>
                      </div>
                      <div className="px-8 py-4 bg-white/25 backdrop-blur-md rounded-2xl border border-white/40">
                        <p className="text-2xl text-white font-bold mb-2 drop-shadow-lg">Your Garden Awaits</p>
                        <p className="text-base text-green-100">Choose a reward and start growing</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Vine Progress Bar at Bottom */}
                {game && !game.isComplete && !game.isExpired && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 z-20">
                    {/* Soil/ground base */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700/80" />
                    
                    {/* Vine growing along bottom */}
                    <svg className="absolute bottom-4 left-0 w-full h-12" viewBox="0 0 400 48" preserveAspectRatio="none">
                      {/* Vine stem - grows based on percentage */}
                      <path
                        d={`M 0 40 Q 50 30, 100 35 T 200 32 T 300 36 T ${game.growthPercentage * 4} 34`}
                        fill="none"
                        stroke="#166534"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        style={{ 
                          strokeDasharray: 1000,
                          strokeDashoffset: 1000 - (game.growthPercentage * 10)
                        }}
                      />
                      {/* Vine leaves along the path */}
                      {[...Array(Math.floor(game.growthPercentage / 10))].map((_, i) => (
                        <g key={i} transform={`translate(${40 + i * 35}, ${30 + (i % 2 ? -5 : 5)})`}>
                          <ellipse 
                            cx="0" cy="0" rx="8" ry="5" 
                            fill="#22c55e"
                            transform={`rotate(${i % 2 ? -30 : 30})`}
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        </g>
                      ))}
                      {/* Flowers at higher percentages */}
                      {game.growthPercentage >= 50 && (
                        <circle cx={game.growthPercentage * 3.5} cy="28" r="6" fill="#f472b6" className="animate-pulse" />
                      )}
                      {game.growthPercentage >= 75 && (
                        <circle cx={game.growthPercentage * 2.5} cy="32" r="5" fill="#fbbf24" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                      )}
                    </svg>
                    
                    {/* Small percentage indicator on the vine */}
                    <div 
                      className="absolute bottom-8 bg-green-800 text-white text-xs font-bold px-2 py-1 rounded-full transition-all duration-700"
                      style={{ left: `calc(${Math.min(game.growthPercentage, 90)}% - 16px)` }}
                    >
                      {Math.round(game.growthPercentage)}%
                    </div>
                  </div>
                )}
                
                {/* Ground for non-game states */}
                {(!game || game.isComplete || game.isExpired) && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-900 via-amber-800 to-transparent" />
                )}
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
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                        <p className="text-lg font-bold">{game.waterCount}</p>
                        <p className="text-xs text-muted-foreground">Watered</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Leaf className="h-5 w-5 mx-auto text-green-500 mb-1" />
                        <p className="text-lg font-bold">{game.plantFood}</p>
                        <p className="text-xs text-muted-foreground">Food</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                        <p className="text-lg font-bold">{Math.max(0, Math.ceil((new Date(game.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}</p>
                        <p className="text-xs text-muted-foreground">Days Left</p>
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
                            Water (+1%)
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={shareGameLink}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
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
                    <p className="text-sm text-muted-foreground">Log in and water every 4 hours (+1% growth)</p>
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
                    <p className="text-sm text-muted-foreground">+5% for orders under $50, +10% for $50+</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                  <Users className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Refer Friends</p>
                    <p className="text-sm text-muted-foreground">When someone signs up with your code (+5% growth)</p>
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
              Choose your reward and manifestation to begin growing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Reward Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reward Type</label>
              <Select 
                value={selectedReward.type} 
                onValueChange={(type) => setSelectedReward({ type, id: '', name: '' })}
                data-testid="reward-type-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reward type" />
                </SelectTrigger>
                <SelectContent>
                  {rewardTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} ({rt.targetDays} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specific Reward Selection */}
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
                  data-testid="reward-select"
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

            {/* Manifestation Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Your Manifestation</label>
              <Select 
                value={selectedManifestation}
                onValueChange={setSelectedManifestation}
                data-testid="manifestation-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manifestation" />
                </SelectTrigger>
                <SelectContent>
                  {manifestations.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">({m.plantType})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedManifestation && (
                <p className="text-xs text-muted-foreground italic">
                  {manifestations.find(m => m.id === selectedManifestation)?.description}
                </p>
              )}
            </div>

            {/* Selected manifestation plant preview */}
            {selectedManifestation && (
              <div className="flex justify-center py-2">
                <div className="text-center">
                  <img 
                    src={manifestations.find(m => m.id === selectedManifestation)?.plantImage}
                    alt="Your plant"
                    className="w-20 h-20 object-cover rounded-full border-2 border-green-200 mx-auto"
                  />
                  <p className="text-sm text-green-700 mt-2 font-medium">
                    {manifestations.find(m => m.id === selectedManifestation)?.plantType}
                  </p>
                </div>
              </div>
            )}

            {/* Target days info */}
            {selectedReward.type && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Time to grow:</strong> {rewardTypes.find(rt => rt.id === selectedReward.type)?.targetDays || 28} days
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Water your plant daily and share with friends to reach 100% growth before time runs out!
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartGame(false)}>
              Cancel
            </Button>
            <Button 
              onClick={startGame} 
              className="bg-green-600 hover:bg-green-700" 
              disabled={!selectedReward.id || !selectedManifestation}
              data-testid="plant-seed-btn"
            >
              <Leaf className="h-4 w-4 mr-2" />
              Plant My Seed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

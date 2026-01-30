import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Gamepad2, Target, Sparkles, Leaf, Plus, Pencil, Trash2, RefreshCw, Users, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const GameSettings = () => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Reward Types
  const [rewardTypes, setRewardTypes] = useState([]);
  const [editingRewardType, setEditingRewardType] = useState(null);
  const [showRewardTypeDialog, setShowRewardTypeDialog] = useState(false);
  const [newRewardType, setNewRewardType] = useState({
    id: '',
    name: '',
    targetDays: 30,
    order: 1
  });
  
  // Manifestations
  const [manifestations, setManifestations] = useState([]);
  const [showManifestationDialog, setShowManifestationDialog] = useState(false);
  const [editingManifestation, setEditingManifestation] = useState(null);
  const [newManifestation, setNewManifestation] = useState({
    name: '',
    description: '',
    plantType: '',
    plantImage: '',
    order: 1
  });

  // Active Games
  const [activeGames, setActiveGames] = useState([]);
  const [resettingGame, setResettingGame] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rewardRes, manifestRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/api/game/reward-types`),
        fetch(`${API_URL}/api/game/manifestations`),
        fetch(`${API_URL}/api/admin/games/active`, { headers: getAuthHeaders() })
      ]);
      
      if (rewardRes.ok) {
        setRewardTypes(await rewardRes.json());
      }
      if (manifestRes.ok) {
        setManifestations(await manifestRes.json());
      }
      if (gamesRes.ok) {
        setActiveGames(await gamesRes.json());
      }
    } catch (error) {
      console.error('Failed to load game settings:', error);
      toast.error('Failed to load game settings');
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset game handler
  const handleResetGame = async (gameId, userName) => {
    if (!confirm(`Are you sure you want to reset ${userName}'s game?\n\nThis will delete their current progress and allow them to start a new game from scratch.`)) {
      return;
    }
    
    setResettingGame(gameId);
    try {
      const response = await fetch(`${API_URL}/api/admin/games/${gameId}/reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success(`${userName}'s game has been reset. They can now start fresh!`);
        loadData();
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to reset game');
      }
    } catch (error) {
      toast.error('Failed to reset game');
    }
    setResettingGame(null);
  };

  // Reward Type handlers
  const handleUpdateRewardType = async (typeId, targetDays) => {
    setSaving(true);
    try {
      const rewardType = rewardTypes.find(rt => rt.id === typeId);
      const response = await fetch(`${API_URL}/api/game/reward-types/${typeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ...rewardType, targetDays: parseInt(targetDays) })
      });
      
      if (response.ok) {
        toast.success('Reward type updated!');
        setEditingRewardType(null);
        loadData();
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
    setSaving(false);
  };

  const handleCreateRewardType = async () => {
    if (!newRewardType.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/game/reward-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newRewardType,
          id: newRewardType.id || newRewardType.name.toLowerCase().replace(/\s+/g, '_'),
          order: rewardTypes.length + 1
        })
      });
      
      if (response.ok) {
        toast.success('Reward type created!');
        setShowRewardTypeDialog(false);
        setNewRewardType({ id: '', name: '', targetDays: 30, order: 1 });
        loadData();
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to create');
      }
    } catch (error) {
      toast.error('Failed to create');
    }
    setSaving(false);
  };

  const handleDeleteRewardType = async (typeId) => {
    if (!confirm('Are you sure you want to delete this reward type?\n\nNote: Users who already have a plant growing with this reward will still receive it. They just won\'t be able to select it for new games.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/game/reward-types/${typeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success('Reward type deleted');
        loadData();
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Manifestation handlers
  const handleSaveManifestation = async () => {
    setSaving(true);
    try {
      const isEdit = !!editingManifestation;
      const url = isEdit 
        ? `${API_URL}/api/game/manifestations/${editingManifestation.id}`
        : `${API_URL}/api/game/manifestations`;
      
      const data = isEdit ? editingManifestation : newManifestation;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast.success(isEdit ? 'Manifestation updated!' : 'Manifestation created!');
        setShowManifestationDialog(false);
        setEditingManifestation(null);
        setNewManifestation({ name: '', description: '', plantType: '', plantImage: '', order: manifestations.length + 1 });
        loadData();
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const handleDeleteManifestation = async (id) => {
    if (!confirm('Are you sure you want to delete this manifestation?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/game/manifestations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success('Manifestation deleted');
        loadData();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEditManifestation = (m) => {
    setEditingManifestation({ ...m });
    setShowManifestationDialog(true);
  };

  const openAddManifestation = () => {
    setEditingManifestation(null);
    setNewManifestation({ 
      name: '', 
      description: '', 
      plantType: '', 
      plantImage: '', 
      order: manifestations.length + 1 
    });
    setShowManifestationDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gamepad2 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="font-heading text-2xl font-bold">Game Settings</h2>
          <p className="text-muted-foreground">Configure the Healing Garden game</p>
        </div>
      </div>

      {/* Active Games Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Active Plant Games</CardTitle>
                <CardDescription>View and manage users' current plant games</CardDescription>
              </div>
            </div>
            {activeGames.length > 0 && (
              <Badge variant="secondary">{activeGames.length} active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active plant games at the moment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeGames.map((game) => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(game.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
                  return (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {game.userProfileImage ? (
                            <img 
                              src={game.userProfileImage} 
                              alt={game.userName} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {game.userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{game.userName}</p>
                            <p className="text-xs text-muted-foreground">{game.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {game.plantImage && (
                            <img 
                              src={game.plantImage} 
                              alt={game.plantType} 
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{game.plantType || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{game.manifestationName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{game.rewardName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{game.rewardType}</p>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{Math.round(game.growthPercentage)}%</span>
                          </div>
                          <Progress value={game.growthPercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"}>
                          {daysLeft} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetGame(game.id, game.userName)}
                          disabled={resettingGame === game.id}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          data-testid={`reset-game-${game.id}`}
                        >
                          {resettingGame === game.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reset
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reward Types Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Reward Types & Target Days</CardTitle>
                <CardDescription>Set how many days users have to grow their plant for each reward type</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowRewardTypeDialog(true)} size="sm" data-testid="add-reward-type-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Reward Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward Type</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Target Days</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardTypes.map((rt) => (
                <TableRow key={rt.id}>
                  <TableCell className="font-medium">{rt.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{rt.id}</TableCell>
                  <TableCell>
                    {editingRewardType === rt.id ? (
                      <Input
                        type="number"
                        min="1"
                        className="w-24"
                        defaultValue={rt.targetDays}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateRewardType(rt.id, e.target.value);
                          }
                        }}
                        onBlur={(e) => handleUpdateRewardType(rt.id, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className="font-mono">{rt.targetDays} days</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRewardType(rt.id)}
                        data-testid={`edit-reward-${rt.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRewardType(rt.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-reward-${rt.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rewardTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No reward types configured. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manifestations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Manifestations & Plants</CardTitle>
                <CardDescription>Each manifestation is linked to a specific plant type</CardDescription>
              </div>
            </div>
            <Button onClick={openAddManifestation} data-testid="add-manifestation-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Manifestation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plant</TableHead>
                <TableHead>Manifestation</TableHead>
                <TableHead>Plant Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifestations.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.plantImage ? (
                      <img 
                        src={m.plantImage} 
                        alt={m.plantType} 
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.plantType}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{m.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditManifestation(m)}
                      data-testid={`edit-manifestation-${m.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteManifestation(m.id)}
                      className="text-destructive"
                      data-testid={`delete-manifestation-${m.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Reward Type Dialog */}
      <Dialog open={showRewardTypeDialog} onOpenChange={setShowRewardTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Add Reward Type
            </DialogTitle>
            <DialogDescription>
              Create a new reward type for the plant growing game
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rewardName">Name *</Label>
              <Input
                id="rewardName"
                placeholder="e.g., Workshop"
                value={newRewardType.name}
                onChange={(e) => setNewRewardType({ ...newRewardType, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rewardId">ID (optional)</Label>
              <Input
                id="rewardId"
                placeholder="Auto-generated from name if empty"
                value={newRewardType.id}
                onChange={(e) => setNewRewardType({ ...newRewardType, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              />
              <p className="text-xs text-muted-foreground">Used internally to identify this reward type</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rewardDays">Target Days *</Label>
              <Input
                id="rewardDays"
                type="number"
                min="1"
                placeholder="30"
                value={newRewardType.targetDays}
                onChange={(e) => setNewRewardType({ ...newRewardType, targetDays: parseInt(e.target.value) || 30 })}
              />
              <p className="text-xs text-muted-foreground">How many days users have to reach 100% growth</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardTypeDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateRewardType} disabled={saving || !newRewardType.name.trim()}>
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Reward Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manifestation Dialog */}
      <Dialog open={showManifestationDialog} onOpenChange={setShowManifestationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              {editingManifestation ? 'Edit Manifestation' : 'Add Manifestation'}
            </DialogTitle>
            <DialogDescription>
              Link a manifestation intention to a plant type
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manifestName">Manifestation Name *</Label>
                <Input
                  id="manifestName"
                  placeholder="e.g., Abundance"
                  value={editingManifestation?.name || newManifestation.name}
                  onChange={(e) => {
                    if (editingManifestation) {
                      setEditingManifestation({ ...editingManifestation, name: e.target.value });
                    } else {
                      setNewManifestation({ ...newManifestation, name: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantType">Plant Type *</Label>
                <Input
                  id="plantType"
                  placeholder="e.g., Money Tree"
                  value={editingManifestation?.plantType || newManifestation.plantType}
                  onChange={(e) => {
                    if (editingManifestation) {
                      setEditingManifestation({ ...editingManifestation, plantType: e.target.value });
                    } else {
                      setNewManifestation({ ...newManifestation, plantType: e.target.value });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manifestDesc">Description</Label>
              <Textarea
                id="manifestDesc"
                placeholder="Describe what this manifestation represents..."
                rows={2}
                value={editingManifestation?.description || newManifestation.description}
                onChange={(e) => {
                  if (editingManifestation) {
                    setEditingManifestation({ ...editingManifestation, description: e.target.value });
                  } else {
                    setNewManifestation({ ...newManifestation, description: e.target.value });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantImage">Plant Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="plantImage"
                  placeholder="https://..."
                  value={editingManifestation?.plantImage || newManifestation.plantImage}
                  onChange={(e) => {
                    if (editingManifestation) {
                      setEditingManifestation({ ...editingManifestation, plantImage: e.target.value });
                    } else {
                      setNewManifestation({ ...newManifestation, plantImage: e.target.value });
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Paste an image URL or the system will auto-generate one based on the plant type
              </p>
            </div>

            {/* Image Preview */}
            {(editingManifestation?.plantImage || newManifestation.plantImage) && (
              <div className="flex justify-center">
                <img
                  src={editingManifestation?.plantImage || newManifestation.plantImage}
                  alt="Plant preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={editingManifestation?.order || newManifestation.order}
                onChange={(e) => {
                  if (editingManifestation) {
                    setEditingManifestation({ ...editingManifestation, order: parseInt(e.target.value) });
                  } else {
                    setNewManifestation({ ...newManifestation, order: parseInt(e.target.value) });
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManifestationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveManifestation} 
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Saving...' : (editingManifestation ? 'Save Changes' : 'Add Manifestation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

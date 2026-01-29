import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Send, Users, Lock, Sparkles, UserPlus, LogIn } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const CommunityPage = () => {
  const { user, getAuthHeaders, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMember = user?.isCommunityMember === true;

  // Load posts from API
  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/community-posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
    setLoading(false);
  }, []);

  // Load member count
  const loadMemberCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/community/members/count`);
      if (response.ok) {
        const data = await response.json();
        setMemberCount(data.count);
      }
    } catch (error) {
      console.error('Failed to load member count:', error);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadMemberCount();
  }, [loadPosts, loadMemberCount]);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Please login first to join the community');
      navigate('/login');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`${API_URL}/api/community/join`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Welcome to the Community Circle! 🎉');
        // Refresh user data to get updated isCommunityMember status
        if (refreshUser) {
          await refreshUser();
        }
        loadMemberCount();
      } else {
        toast.error('Failed to join community');
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
    setIsJoining(false);
  };

  const handleCreatePost = async () => {
    if (!user || !isMember) {
      toast.error('Please join the community to create posts');
      return;
    }

    if (!newPost.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/community-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.name,
          content: newPost,
          membershipLevel: user.membershipLevel || 'Basic'
        })
      });

      if (response.ok) {
        toast.success('Post shared with the community!');
        setNewPost('');
        loadPosts();
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    if (!user || !isMember) {
      toast.error('Please join the community to like posts');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/community-posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Non-member view - Show join prompt
  if (!isMember) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Community Circle</h1>
            <p className="text-lg text-muted-foreground">
              A private space for our wellness community members
            </p>
          </div>

          {/* Member Count Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-base">
              <Users className="h-4 w-4 mr-2" />
              {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
            </Badge>
          </div>

          {/* Private Community Card */}
          <Card className="max-w-lg mx-auto border-2 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-heading text-2xl">Members Only</CardTitle>
              <CardDescription className="text-base">
                This community is private and exclusive to members
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-center">As a member, you can:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    Share your wellness journey with like-minded individuals
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    Connect and support others on their healing path
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    Access exclusive community discussions and resources
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    Get tips and advice from experienced practitioners
                  </li>
                </ul>
              </div>

              {/* Join/Login Buttons */}
              <div className="space-y-3 pt-4">
                {user ? (
                  <Button 
                    onClick={handleJoinCommunity}
                    disabled={isJoining}
                    className="w-full bg-primary hover:bg-primary-dark text-lg py-6"
                    data-testid="join-community-btn"
                  >
                    {isJoining ? (
                      <>Joining...</>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Join the Community
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-primary hover:bg-primary-dark text-lg py-6"
                      data-testid="login-to-join-btn"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Login to Join
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <button 
                        onClick={() => navigate('/register')}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign up here
                      </button>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview - blurred posts */}
          <div className="mt-12">
            <h3 className="text-center text-muted-foreground mb-6">Recent Community Activity</h3>
            <div className="space-y-4 opacity-60 blur-sm pointer-events-none select-none">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-muted/30">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Member view - Full community access
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
            <Users className="h-3 w-3 mr-1" />
            {memberCount} Members
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Community Circle</h1>
          <p className="text-lg text-muted-foreground">
            Connect, share, and grow together on your wellness journey
          </p>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Share with the Community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind? Share your journey, ask questions, or offer support..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={4}
              className="resize-none"
              data-testid="new-post-textarea"
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreatePost}
              className="ml-auto bg-primary hover:bg-primary-dark"
              data-testid="share-post-btn"
            >
              <Send className="mr-2 h-4 w-4" />
              Share Post
            </Button>
          </CardFooter>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base">{post.author}</CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              post.membershipLevel === 'Gold' || post.membershipLevel === 'platinum'
                                ? 'border-warning text-warning'
                                : post.membershipLevel === 'Silver'
                                ? 'border-muted-foreground text-muted-foreground'
                                : 'border-primary text-primary'
                            }`}
                          >
                            {post.membershipLevel || 'Basic'}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {formatTimestamp(post.date)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t pt-4">
                  <div className="flex items-center space-x-4 w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="hover:bg-accent/10"
                      data-testid={`like-btn-${post.id}`}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto hover:bg-secondary/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Welcome to the Community!</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your wellness journey with the community.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

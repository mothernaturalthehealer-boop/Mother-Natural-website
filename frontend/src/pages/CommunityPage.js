import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Send, Users } from 'lucide-react';

export const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);

  // Load posts from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save posts to localStorage whenever they change
  const savePosts = (updatedPosts) => {
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleCreatePost = () => {
    if (!user) {
      toast.error('Please login to create posts');
      navigate('/login');
      return;
    }

    if (!newPost.trim()) {
      toast.error('Please write something');
      return;
    }

    const post = {
      id: Date.now(),
      author: {
        name: user.name,
        avatar: '',
        membershipLevel: user.membershipLevel || 'Basic'
      },
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      tags: []
    };

    const updatedPosts = [post, ...posts];
    savePosts(updatedPosts);
    setNewPost('');
    toast.success('Post shared with the community!');
  };

  const handleLike = (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    const updatedPosts = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
    savePosts(updatedPosts);
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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Community Circle</h1>
          <p className="text-lg text-muted-foreground">
            Connect, share, and grow together on your wellness journey
          </p>
        </div>

        {/* Create Post */}
        {user && (
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
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCreatePost}
                className="ml-auto bg-primary hover:bg-primary-dark"
              >
                <Send className="mr-2 h-4 w-4" />
                Share Post
              </Button>
            </CardFooter>
          </Card>
        )}

        {!user && (
          <Card className="mb-8 bg-gradient-subtle border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-xl">Join Our Community</CardTitle>
              <CardDescription>
                Login or sign up to share your journey and connect with others
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary-dark">
                Login to Join
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Posts Feed */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base">{post.author.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              post.author.membershipLevel === 'Gold'
                                ? 'border-warning text-warning'
                                : post.author.membershipLevel === 'Silver'
                                ? 'border-muted-foreground text-muted-foreground'
                                : 'border-primary text-primary'
                            }`}
                          >
                            {post.author.membershipLevel}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {formatTimestamp(post.timestamp)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">{post.content}</p>
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
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="text-sm">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{post.comments}</span>
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
              {!user && (
                <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary-dark">
                  Login to Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

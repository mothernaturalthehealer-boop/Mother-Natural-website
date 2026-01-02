import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

export const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        membershipLevel: 'Gold'
      },
      content: 'Just finished the Herbalism class and I\'m blown away! The knowledge shared was incredible. Can\'t wait to start making my own tinctures. 🌿',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      tags: ['herbalism', 'wellness']
    },
    {
      id: 2,
      author: {
        name: 'Michelle Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
        membershipLevel: 'Silver'
      },
      content: 'The Mountain Meditation Retreat changed my life. I found a peace I didn\'t know was possible. Grateful to this amazing community for the support! 🙏',
      timestamp: '5 hours ago',
      likes: 42,
      comments: 15,
      tags: ['retreat', 'meditation', 'gratitude']
    },
    {
      id: 3,
      author: {
        name: 'Jennifer Lee',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        membershipLevel: 'Basic'
      },
      content: 'New to the community! Looking forward to connecting with all of you beautiful souls. Any recommendations for a complete beginner?',
      timestamp: '1 day ago',
      likes: 18,
      comments: 12,
      tags: ['introduction', 'newbie']
    },
    {
      id: 4,
      author: {
        name: 'Amanda Foster',
        avatar: 'https://images.pexels.com/photos/35316298/pexels-photo-35316298.jpeg',
        membershipLevel: 'Gold'
      },
      content: 'Just received my order of the Lavender Calm Tea and Rose Essential Oil. The quality is outstanding! Thank you Mother Natural! 💜',
      timestamp: '2 days ago',
      likes: 31,
      comments: 6,
      tags: ['products', 'review']
    },
  ]);

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
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        membershipLevel: user.membershipLevel || 'Basic'
      },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Post shared with the community!');
  };

  const handleLike = (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
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
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
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
                      <CardDescription className="text-xs">{post.timestamp}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                {post.tags.length > 0 && (
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
      </div>
    </div>
  );
};

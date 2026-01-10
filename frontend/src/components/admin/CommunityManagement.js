import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const CommunityManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/community-posts`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCommunityPosts(data);
      }
    } catch (error) {
      console.error('Failed to load community posts:', error);
      // Fallback to localStorage
      const savedPosts = localStorage.getItem('communityPosts');
      if (savedPosts) setCommunityPosts(JSON.parse(savedPosts));
    }
    setLoading(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDeletePost = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/community-posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast.success('Post deleted');
        loadPosts();
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Community Posts</CardTitle>
          <CardDescription>Moderate community content ({communityPosts.length} posts)</CardDescription>
        </div>
        <Button variant="outline" onClick={loadPosts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {communityPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No community posts yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communityPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.authorName || post.author || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{post.content}</TableCell>
                  <TableCell>{post.likes || 0}</TableCell>
                  <TableCell>{post.comments?.length || 0}</TableCell>
                  <TableCell>{post.date ? new Date(post.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

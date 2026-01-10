import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export const CommunityManagement = () => {
  const [communityPosts, setCommunityPosts] = useState([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) setCommunityPosts(JSON.parse(savedPosts));
  }, []);

  const handleDeletePost = (id) => {
    const updatedPosts = communityPosts.filter(p => p.id !== id);
    setCommunityPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    toast.success('Post deleted');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Community Posts</CardTitle>
        <CardDescription>Moderate community content</CardDescription>
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
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communityPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.authorName || post.author || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{post.content}</TableCell>
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

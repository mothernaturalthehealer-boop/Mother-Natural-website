import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [showAddClassDialog, setShowAddClassDialog] = useState(false);
  const [showEditClassDialog, setShowEditClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '', instructor: '', description: '', duration: '', sessions: '', price: '', schedule: '', spots: '', level: 'All Levels', image: ''
  });

  useEffect(() => {
    const savedClasses = localStorage.getItem('adminClasses');
    if (savedClasses) setClasses(JSON.parse(savedClasses));
  }, []);

  const handleAddClass = () => {
    if (!newClass.name || !newClass.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    const classItem = {
      id: Date.now(),
      name: newClass.name,
      instructor: newClass.instructor || '',
      description: newClass.description || '',
      duration: newClass.duration || '',
      sessions: parseInt(newClass.sessions) || 0,
      price: parseFloat(newClass.price),
      schedule: newClass.schedule || '',
      spots: parseInt(newClass.spots) || 10,
      level: newClass.level,
      image: newClass.image || 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg'
    };
    const updatedClasses = [...classes, classItem];
    setClasses(updatedClasses);
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses));
    toast.success('Class added successfully!');
    setShowAddClassDialog(false);
    setNewClass({ name: '', instructor: '', description: '', duration: '', sessions: '', price: '', schedule: '', spots: '', level: 'All Levels', image: '' });
  };

  const handleEditClass = (classItem) => {
    setEditingClass({ ...classItem });
    setShowEditClassDialog(true);
  };

  const handleSaveEditedClass = () => {
    if (!editingClass.name || !editingClass.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedClasses = classes.map(c => {
      if (c.id === editingClass.id) {
        return {
          ...editingClass,
          price: parseFloat(editingClass.price),
          sessions: parseInt(editingClass.sessions) || 0,
          spots: parseInt(editingClass.spots) || 10
        };
      }
      return c;
    });
    setClasses(updatedClasses);
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses));
    toast.success('Class updated successfully');
    setShowEditClassDialog(false);
    setEditingClass(null);
  };

  const handleDeleteClass = (id) => {
    const updatedClasses = classes.filter(c => c.id !== id);
    setClasses(updatedClasses);
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses));
    toast.success('Class deleted successfully');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Classes</CardTitle>
          <CardDescription>Manage wellness classes</CardDescription>
        </div>
        <Dialog open={showAddClassDialog} onOpenChange={setShowAddClassDialog}>
          <Button onClick={() => setShowAddClassDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Class
          </Button>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Class</DialogTitle>
              <DialogDescription>Create a new wellness class</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name *</Label>
                <Input id="className" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} placeholder="e.g., Morning Yoga Flow" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input id="instructor" value={newClass.instructor} onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })} placeholder="Instructor name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select id="level" value={newClass.level} onChange={(e) => setNewClass({ ...newClass, level: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classDuration">Duration</Label>
                  <Input id="classDuration" value={newClass.duration} onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })} placeholder="6 weeks" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessions">Sessions</Label>
                  <Input id="sessions" type="number" value={newClass.sessions} onChange={(e) => setNewClass({ ...newClass, sessions: e.target.value })} placeholder="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classPrice">Price ($) *</Label>
                  <Input id="classPrice" type="number" value={newClass.price} onChange={(e) => setNewClass({ ...newClass, price: e.target.value })} placeholder="120" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input id="schedule" value={newClass.schedule} onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })} placeholder="Tue & Thu, 6:30 AM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spots">Available Spots</Label>
                  <Input id="spots" type="number" value={newClass.spots} onChange={(e) => setNewClass({ ...newClass, spots: e.target.value })} placeholder="15" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classDesc">Description</Label>
                <Textarea id="classDesc" value={newClass.description} onChange={(e) => setNewClass({ ...newClass, description: e.target.value })} placeholder="Class description..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classImage">Image URL (Optional)</Label>
                <Input id="classImage" value={newClass.image} onChange={(e) => setNewClass({ ...newClass, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-muted-foreground">Paste a URL to an image for this class.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddClassDialog(false)}>Cancel</Button>
              <Button onClick={handleAddClass} className="bg-primary hover:bg-primary-dark">Add Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No classes yet. Click &quot;Add Class&quot; to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">{classItem.name}</TableCell>
                  <TableCell>{classItem.instructor || '-'}</TableCell>
                  <TableCell>{classItem.schedule || '-'}</TableCell>
                  <TableCell>${classItem.price}</TableCell>
                  <TableCell><Badge variant="outline">{classItem.level}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClass(classItem)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Class Dialog */}
      <Dialog open={showEditClassDialog} onOpenChange={setShowEditClassDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Class</DialogTitle>
            <DialogDescription>Update class details</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editClassName">Class Name *</Label>
                <Input id="editClassName" value={editingClass.name} onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editInstructor">Instructor</Label>
                  <Input id="editInstructor" value={editingClass.instructor || ''} onChange={(e) => setEditingClass({ ...editingClass, instructor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLevel">Level</Label>
                  <select id="editLevel" value={editingClass.level} onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editClassDuration">Duration</Label>
                  <Input id="editClassDuration" value={editingClass.duration || ''} onChange={(e) => setEditingClass({ ...editingClass, duration: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSessions">Sessions</Label>
                  <Input id="editSessions" type="number" value={editingClass.sessions || ''} onChange={(e) => setEditingClass({ ...editingClass, sessions: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClassPrice">Price ($) *</Label>
                  <Input id="editClassPrice" type="number" value={editingClass.price} onChange={(e) => setEditingClass({ ...editingClass, price: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSchedule">Schedule</Label>
                  <Input id="editSchedule" value={editingClass.schedule || ''} onChange={(e) => setEditingClass({ ...editingClass, schedule: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSpots">Available Spots</Label>
                  <Input id="editSpots" type="number" value={editingClass.spots || ''} onChange={(e) => setEditingClass({ ...editingClass, spots: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClassDesc">Description</Label>
                <Textarea id="editClassDesc" value={editingClass.description || ''} onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClassImage">Image URL</Label>
                <Input id="editClassImage" value={editingClass.image || ''} onChange={(e) => setEditingClass({ ...editingClass, image: e.target.value })} placeholder="https://example.com/image.jpg" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditClassDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedClass} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RefreshCw, Calendar, Clock, DollarSign, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ImageCropUploader } from '@/components/ImageCropUploader';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ClassManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddClassDialog, setShowAddClassDialog] = useState(false);
  const [showEditClassDialog, setShowEditClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    instructor: '',
    description: '',
    duration: '',
    sessions: '',
    price: '',
    schedule: '',
    spots: '',
    level: 'All Levels',
    image: '',
    startDate: '',
    endDate: '',
    classDays: [],
    classTime: '',
    paymentType: 'full',
    packageDeals: [],
    dropInPrice: ''
  });
  const [newPackageDeal, setNewPackageDeal] = useState({ name: '', sessions: '', price: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/classes`);
      if (response.ok) setClasses(await response.json());
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDayToggle = (day, isNew = true) => {
    if (isNew) {
      const currentDays = newClass.classDays || [];
      if (currentDays.includes(day)) {
        setNewClass({ ...newClass, classDays: currentDays.filter(d => d !== day) });
      } else {
        setNewClass({ ...newClass, classDays: [...currentDays, day] });
      }
    } else {
      const currentDays = editingClass.classDays || [];
      if (currentDays.includes(day)) {
        setEditingClass({ ...editingClass, classDays: currentDays.filter(d => d !== day) });
      } else {
        setEditingClass({ ...editingClass, classDays: [...currentDays, day] });
      }
    }
  };

  const handleAddPackageDeal = (isNew = true) => {
    if (!newPackageDeal.name || !newPackageDeal.sessions || !newPackageDeal.price) {
      toast.error('Please fill in all package deal fields');
      return;
    }
    const deal = {
      name: newPackageDeal.name,
      sessions: parseInt(newPackageDeal.sessions),
      price: parseFloat(newPackageDeal.price)
    };
    if (isNew) {
      setNewClass({ ...newClass, packageDeals: [...(newClass.packageDeals || []), deal] });
    } else {
      setEditingClass({ ...editingClass, packageDeals: [...(editingClass.packageDeals || []), deal] });
    }
    setNewPackageDeal({ name: '', sessions: '', price: '' });
  };

  const handleRemovePackageDeal = (index, isNew = true) => {
    if (isNew) {
      const deals = [...(newClass.packageDeals || [])];
      deals.splice(index, 1);
      setNewClass({ ...newClass, packageDeals: deals });
    } else {
      const deals = [...(editingClass.packageDeals || [])];
      deals.splice(index, 1);
      setEditingClass({ ...editingClass, packageDeals: deals });
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.price) {
      toast.error('Please fill in class name and price');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...newClass,
          price: parseFloat(newClass.price),
          sessions: parseInt(newClass.sessions) || 0,
          spots: parseInt(newClass.spots) || 10,
          dropInPrice: parseFloat(newClass.dropInPrice) || 0,
          image: newClass.image || 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg'
        })
      });
      if (response.ok) {
        toast.success('Class added successfully!');
        setShowAddClassDialog(false);
        setNewClass({
          name: '', instructor: '', description: '', duration: '', sessions: '', price: '',
          schedule: '', spots: '', level: 'All Levels', image: '', startDate: '', endDate: '',
          classDays: [], classTime: '', paymentType: 'full', packageDeals: [], dropInPrice: ''
        });
        loadData();
      }
    } catch (error) {
      toast.error('Failed to add class');
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass({ ...classItem, classDays: classItem.classDays || [], packageDeals: classItem.packageDeals || [] });
    setShowEditClassDialog(true);
  };

  const handleSaveEditedClass = async () => {
    if (!editingClass.name || !editingClass.price) {
      toast.error('Please fill in class name and price');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...editingClass,
          price: parseFloat(editingClass.price),
          sessions: parseInt(editingClass.sessions) || 0,
          spots: parseInt(editingClass.spots) || 10,
          dropInPrice: parseFloat(editingClass.dropInPrice) || 0
        })
      });
      if (response.ok) {
        toast.success('Class updated successfully');
        setShowEditClassDialog(false);
        setEditingClass(null);
        loadData();
      }
    } catch (error) {
      toast.error('Failed to update class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await fetch(`${API_URL}/api/classes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      toast.success('Class deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const formatClassDays = (days) => {
    if (!days || days.length === 0) return '-';
    if (days.length <= 2) return days.join(' & ');
    return days.map(d => d.substring(0, 3)).join(', ');
  };

  const ClassFormFields = ({ data, setData, isNew }) => (
    <div className="space-y-6 py-4">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
        <div className="space-y-2">
          <Label htmlFor={isNew ? "className" : "editClassName"}>Class Name *</Label>
          <Input
            id={isNew ? "className" : "editClassName"}
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="e.g., Morning Yoga Flow"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isNew ? "instructor" : "editInstructor"}>Instructor *</Label>
            <Input
              id={isNew ? "instructor" : "editInstructor"}
              value={data.instructor || ''}
              onChange={(e) => setData({ ...data, instructor: e.target.value })}
              placeholder="Instructor name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isNew ? "level" : "editLevel"}>Level</Label>
            <select
              id={isNew ? "level" : "editLevel"}
              value={data.level}
              onChange={(e) => setData({ ...data, level: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="All Levels">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={isNew ? "classDesc" : "editClassDesc"}>Description *</Label>
          <Textarea
            id={isNew ? "classDesc" : "editClassDesc"}
            value={data.description || ''}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder="Describe what participants will learn and experience..."
            rows={3}
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Schedule & Dates
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isNew ? "startDate" : "editStartDate"}>Start Date *</Label>
            <Input
              id={isNew ? "startDate" : "editStartDate"}
              type="date"
              value={data.startDate || ''}
              onChange={(e) => setData({ ...data, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isNew ? "endDate" : "editEndDate"}>End Date (Optional)</Label>
            <Input
              id={isNew ? "endDate" : "editEndDate"}
              type="date"
              value={data.endDate || ''}
              onChange={(e) => setData({ ...data, endDate: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Class Days (Select all that apply) *</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`${isNew ? 'new' : 'edit'}-day-${day}`}
                  checked={(data.classDays || []).includes(day)}
                  onCheckedChange={() => handleDayToggle(day, isNew)}
                />
                <label htmlFor={`${isNew ? 'new' : 'edit'}-day-${day}`} className="text-sm cursor-pointer">
                  {day.substring(0, 3)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isNew ? "classTime" : "editClassTime"}>Class Time</Label>
            <Input
              id={isNew ? "classTime" : "editClassTime"}
              type="time"
              value={data.classTime || ''}
              onChange={(e) => setData({ ...data, classTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isNew ? "duration" : "editDuration"}>Duration</Label>
            <Input
              id={isNew ? "duration" : "editDuration"}
              value={data.duration || ''}
              onChange={(e) => setData({ ...data, duration: e.target.value })}
              placeholder="e.g., 6 weeks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isNew ? "sessions" : "editSessions"}>Total Sessions</Label>
            <Input
              id={isNew ? "sessions" : "editSessions"}
              type="number"
              value={data.sessions || ''}
              onChange={(e) => setData({ ...data, sessions: e.target.value })}
              placeholder="12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={isNew ? "spots" : "editSpots"}>Available Spots</Label>
          <Input
            id={isNew ? "spots" : "editSpots"}
            type="number"
            value={data.spots || ''}
            onChange={(e) => setData({ ...data, spots: e.target.value })}
            placeholder="15"
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Pricing (Full Payment Upfront)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isNew ? "price" : "editPrice"}>Full Course Price ($) *</Label>
            <Input
              id={isNew ? "price" : "editPrice"}
              type="number"
              step="0.01"
              value={data.price || ''}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              placeholder="120.00"
            />
            <p className="text-xs text-muted-foreground">Amount customers pay upfront for the full class</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={isNew ? "dropInPrice" : "editDropInPrice"}>Drop-in Price ($)</Label>
            <Input
              id={isNew ? "dropInPrice" : "editDropInPrice"}
              type="number"
              step="0.01"
              value={data.dropInPrice || ''}
              onChange={(e) => setData({ ...data, dropInPrice: e.target.value })}
              placeholder="15.00"
            />
            <p className="text-xs text-muted-foreground">Price for single class drop-in (optional)</p>
          </div>
        </div>
      </div>

      {/* Package Deals Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Package className="h-4 w-4" /> Package Deals (Optional)
        </h3>
        <p className="text-xs text-muted-foreground">Offer discounted packages for multiple classes</p>
        
        {/* Existing Package Deals */}
        {(data.packageDeals || []).length > 0 && (
          <div className="space-y-2">
            {data.packageDeals.map((deal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">{deal.name}</span>
                  <span className="text-muted-foreground ml-2">({deal.sessions} sessions - ${deal.price})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePackageDeal(index, isNew)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Package Deal */}
        <div className="grid grid-cols-4 gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Package Name</Label>
            <Input
              value={newPackageDeal.name}
              onChange={(e) => setNewPackageDeal({ ...newPackageDeal, name: e.target.value })}
              placeholder="4-Class Pack"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sessions</Label>
            <Input
              type="number"
              value={newPackageDeal.sessions}
              onChange={(e) => setNewPackageDeal({ ...newPackageDeal, sessions: e.target.value })}
              placeholder="4"
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={newPackageDeal.price}
              onChange={(e) => setNewPackageDeal({ ...newPackageDeal, price: e.target.value })}
              placeholder="50"
              className="h-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddPackageDeal(isNew)}
            className="h-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Section */}
      <ImageCropUploader
        label="Class Image"
        currentImage={data.image || ''}
        onImageUploaded={(url) => setData({ ...data, image: url })}
        aspectRatio={16/9}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl">Classes</CardTitle>
          <CardDescription>Manage wellness classes with scheduling and pricing</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={() => setShowAddClassDialog(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />Add Class
          </Button>
        </div>
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
                <TableHead>Days</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.filter(c => c.id).map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{classItem.name}</span>
                      {classItem.sessions > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">({classItem.sessions} sessions)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{classItem.instructor || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatClassDays(classItem.classDays)}</span>
                      {classItem.classTime && <span className="text-xs text-muted-foreground ml-1">@ {classItem.classTime}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{classItem.startDate || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">${classItem.price}</span>
                      {classItem.packageDeals && classItem.packageDeals.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">+{classItem.packageDeals.length} packages</Badge>
                      )}
                    </div>
                  </TableCell>
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

      {/* Add Class Dialog */}
      <Dialog open={showAddClassDialog} onOpenChange={setShowAddClassDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New Class</DialogTitle>
            <DialogDescription>Create a new wellness class with full scheduling and pricing details</DialogDescription>
          </DialogHeader>
          <ClassFormFields data={newClass} setData={setNewClass} isNew={true} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassDialog(false)}>Cancel</Button>
            <Button onClick={handleAddClass} className="bg-primary hover:bg-primary-dark">Add Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={showEditClassDialog} onOpenChange={setShowEditClassDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Class</DialogTitle>
            <DialogDescription>Update class details</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <ClassFormFields data={editingClass} setData={setEditingClass} isNew={false} />
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Users, Calendar, Mountain, Settings, Check, X, Eye, Mail, Send, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'teas',
    description: ''
  });

  const [fundraisers, setFundraisers] = useState([]);
  const [showAddFundraiserDialog, setShowAddFundraiserDialog] = useState(false);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '',
    beneficiary: '',
    story: '',
    goalAmount: '',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    endDate: ''
  });

  const [contractTemplates, setContractTemplates] = useState({});
  const [signedContracts, setSignedContracts] = useState([]);
  const [editingContract, setEditingContract] = useState(null);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  
  // Services management
  const [services, setServices] = useState([]);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
    paymentType: 'full',
    deposit: ''
  });

  // Retreats management
  const [retreats, setRetreats] = useState([]);
  const [showAddRetreatDialog, setShowAddRetreatDialog] = useState(false);
  const [newRetreat, setNewRetreat] = useState({
    name: '',
    location: '',
    duration: '',
    dates: '',
    price: '',
    description: '',
    capacity: '',
    image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg'
  });

  // Community posts management
  const [communityPosts, setCommunityPosts] = useState([]);

  // Settings dialog
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    businessName: 'Mother Natural: The Healing Lab',
    contactEmail: 'admin@mothernatural.com',
    contactPhone: '',
    notificationsEnabled: true
  });

  // Appointments management (loaded from localStorage)
  const [userAppointments, setUserAppointments] = useState([]);

  // Service editing
  const [editingService, setEditingService] = useState(null);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);

  // Retreat editing
  const [editingRetreat, setEditingRetreat] = useState(null);
  const [showEditRetreatDialog, setShowEditRetreatDialog] = useState(false);

  // Active tab state for navigation from stat cards
  const [activeTab, setActiveTab] = useState('products');

  // Check authentication and admin role
  useEffect(() => {
    // Don't run check while still loading
    if (loading) return;
    
    if (!user) {
      toast.error('Please login to access the admin panel');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    const savedFundraisers = localStorage.getItem('fundraisers');
    if (savedFundraisers) {
      setFundraisers(JSON.parse(savedFundraisers));
    }

    // Load contract templates
    const savedContracts = localStorage.getItem('contractTemplates');
    if (savedContracts) {
      setContractTemplates(JSON.parse(savedContracts));
    } else {
      setContractTemplates(defaultContractTemplates);
    }

    // Load signed contracts
    const savedSignedContracts = localStorage.getItem('signedContracts');
    if (savedSignedContracts) {
      setSignedContracts(JSON.parse(savedSignedContracts));
    }

    // Load emergency requests
    const savedEmergencyRequests = localStorage.getItem('emergencyRequests');
    if (savedEmergencyRequests) {
      setEmergencyRequests(JSON.parse(savedEmergencyRequests));
    }

    // Load services
    const savedServices = localStorage.getItem('adminServices');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    }

    // Load retreats  
    const savedRetreats = localStorage.getItem('adminRetreats');
    if (savedRetreats) {
      setRetreats(JSON.parse(savedRetreats));
    }

    // Load community posts
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setCommunityPosts(JSON.parse(savedPosts));
    }

    // Load user appointments
    const savedAppointments = localStorage.getItem('userAppointments');
    if (savedAppointments) {
      setUserAppointments(JSON.parse(savedAppointments));
    }

    // Load admin settings
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }
  }, []);

  const defaultContractTemplates = {
    appointment: `APPOINTMENT BOOKING AGREEMENT\n\nThis agreement is between Mother Natural: The Healing Lab and the client for appointment booking services.\n\n1. CANCELLATION POLICY\n- Cancellations must be made at least 24 hours in advance\n- Cancellations made less than 24 hours before the scheduled appointment will result in a 50% charge\n- No-shows will be charged the full appointment fee\n\n2. RESCHEDULING\n- Appointments may be rescheduled up to 24 hours in advance at no charge\n- Late arrivals may result in shortened appointment time\n\n3. PAYMENT TERMS\n- Payment is due at the time of booking\n- Accepted payment methods include credit/debit cards\n\n4. HEALTH & WELLNESS\n- Client agrees to disclose any relevant health conditions\n- Services are complementary and not a substitute for medical care\n- Client releases Mother Natural from liability for any adverse reactions\n\n5. CONDUCT\n- Client agrees to maintain respectful behavior during appointments\n- Mother Natural reserves the right to refuse service\n\nBy signing below, you acknowledge that you have read, understood, and agree to these terms.`,
    retreat: `RETREAT BOOKING AGREEMENT\n\nThis agreement is between Mother Natural: The Healing Lab and the client for retreat booking services.\n\n1. CANCELLATION & REFUND POLICY\n- Cancellations more than 60 days before retreat: Full refund minus $100 processing fee\n- Cancellations 30-60 days before retreat: 50% refund\n- Cancellations less than 30 days before retreat: No refund\n- Deposits are non-refundable\n\n2. PAYMENT TERMS\n- Payment plans available as specified during booking\n- Final payment must be received 30 days before retreat start date\n- Failure to complete payment may result in forfeiture of booking\n\n3. PARTICIPANT RESPONSIBILITIES\n- Participants must be in reasonable health to participate\n- Special dietary requirements must be communicated at least 14 days in advance\n- Participants are responsible for their own travel arrangements and insurance\n\n4. RETREAT POLICIES\n- Participants agree to follow retreat schedule and guidelines\n- Use of alcohol or illegal substances is prohibited\n- Disruptive behavior may result in removal without refund\n\n5. LIABILITY WAIVER\n- Client acknowledges physical activities and releases Mother Natural from liability\n- Client is responsible for their own health insurance\n- Mother Natural is not liable for lost or stolen personal items\n\n6. CHANGES TO RETREAT\n- Mother Natural reserves the right to modify retreat schedule due to weather or circumstances\n- In case of retreat cancellation by Mother Natural, full refund will be provided\n\nBy signing below, you acknowledge that you have read, understood, and agree to these terms.`
  };

  const [products, setProducts] = useState([]);

  // Product categories (customizable)
  const [categories, setCategories] = useState(['Teas', 'Tinctures', 'Oils', 'Books']);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Orders (loaded from localStorage/backend)
  const [orders, setOrders] = useState([]);

  // Classes management
  const [classes, setClasses] = useState([]);
  const [showAddClassDialog, setShowAddClassDialog] = useState(false);
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
    image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg'
  });
  const [editingClass, setEditingClass] = useState(null);
  const [showEditClassDialog, setShowEditClassDialog] = useState(false);

  // Product editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);

  // Registered users count
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [usersList, setUsersList] = useState([]);

  // Email management
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);

  // Load products and classes from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    const savedClasses = localStorage.getItem('adminClasses');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }

    // Load registered users from localStorage
    const users = localStorage.getItem('registeredUsers');
    if (users) {
      const parsedUsers = JSON.parse(users);
      setUsersList(Array.isArray(parsedUsers) ? parsedUsers : []);
      setRegisteredUsers(Array.isArray(parsedUsers) ? parsedUsers.length : 0);
      
      // Sync users to backend
      syncUsersToBackend(parsedUsers);
    }

    // Load email logs
    fetchEmailLogs();
  }, []);

  // Sync users to backend for email functionality
  const syncUsersToBackend = async (users) => {
    try {
      await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      });
    } catch (error) {
      console.error('Failed to sync users:', error);
    }
  };

  // Fetch email logs from backend
  const fetchEmailLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/email/logs`);
      if (response.ok) {
        const logs = await response.json();
        setEmailLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    }
  };

  // Send personal email
  const handleSendPersonalEmail = async () => {
    if (!selectedUserForEmail || !emailSubject || !emailContent) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: selectedUserForEmail.email,
          subject: emailSubject,
          html_content: generateEmailHTML(emailContent)
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Email sent to ${selectedUserForEmail.name}`);
        setShowEmailDialog(false);
        setSelectedUserForEmail(null);
        setEmailSubject('');
        setEmailContent('');
        fetchEmailLogs();
      } else {
        throw new Error(data.detail || 'Failed to send email');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send bulk email
  const handleSendBulkEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    if (usersList.length === 0) {
      toast.error('No users to send email to');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/api/email/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_emails: usersList.map(u => u.email),
          subject: emailSubject,
          html_content: generateEmailHTML(emailContent)
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Bulk email sent: ${data.sent_count} delivered, ${data.failed_count} failed`);
        setShowBulkEmailDialog(false);
        setEmailSubject('');
        setEmailContent('');
        fetchEmailLogs();
      } else {
        throw new Error(data.detail || 'Failed to send bulk email');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Generate HTML email template
  const generateEmailHTML = (content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f5ff;">
      <div style="background: linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Mother Natural: The Healing Lab</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">${content}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Suffolk County, New York<br>
          Mothernaturalcontact@gmail.com
        </p>
      </div>
    </body>
    </html>
    `;
  };

  // Open email dialog for specific user
  const openEmailDialogForUser = (userItem) => {
    setSelectedUserForEmail(userItem);
    setEmailSubject('');
    setEmailContent('');
    setShowEmailDialog(true);
  };

  // Clickable stat cards - link to appropriate tabs
  const stats = [
    { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'text-primary', tab: 'products' },
    { label: 'Registered Users', value: registeredUsers.toString(), icon: Users, color: 'text-accent', tab: 'users' },
    { label: 'Appointments', value: userAppointments.length.toString(), icon: Calendar, color: 'text-secondary', tab: 'appointments' },
    { label: 'Retreats Booked', value: retreats.length.toString(), icon: Mountain, color: 'text-natural', tab: 'retreats' },
  ];

  const recentOrders = [
    { id: '1001', customer: 'Sarah Johnson', total: 51.98, status: 'Shipped', date: 'June 10, 2024' },
    { id: '1002', customer: 'Michael Chen', total: 189.00, status: 'Processing', date: 'June 11, 2024' },
    { id: '1003', customer: 'Jennifer Lee', total: 24.99, status: 'Delivered', date: 'June 9, 2024' },
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      description: newProduct.description || '',
      stock: 0,
      inStock: true,
      image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg',
      rating: 4.5
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    toast.success('Product added successfully!');
    setShowAddProductDialog(false);
    setNewProduct({ name: '', price: '', category: 'teas', description: '' });
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    toast.success('Product deleted successfully');
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setShowEditProductDialog(true);
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct.name || !editingProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedProducts = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...editingProduct,
          price: parseFloat(editingProduct.price)
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    toast.success('Product updated successfully');
    setShowEditProductDialog(false);
    setEditingProduct(null);
  };

  // Class handlers
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
      image: newClass.image
    };

    const updatedClasses = [...classes, classItem];
    setClasses(updatedClasses);
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses));
    toast.success('Class added successfully!');
    setShowAddClassDialog(false);
    setNewClass({
      name: '',
      instructor: '',
      description: '',
      duration: '',
      sessions: '',
      price: '',
      schedule: '',
      spots: '',
      level: 'All Levels',
      image: 'https://images.pexels.com/photos/7879933/pexels-photo-7879933.jpeg'
    });
  };

  const handleDeleteClass = (id) => {
    const updatedClasses = classes.filter(c => c.id !== id);
    setClasses(updatedClasses);
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses));
    toast.success('Class deleted successfully');
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

  const handleAddFundraiser = () => {
    if (!newFundraiser.title || !newFundraiser.beneficiary || !newFundraiser.goalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const fundraiser = {
      id: Date.now(),
      title: newFundraiser.title,
      beneficiary: newFundraiser.beneficiary,
      story: newFundraiser.story,
      goalAmount: parseFloat(newFundraiser.goalAmount),
      raisedAmount: 0,
      image: newFundraiser.image,
      createdDate: new Date().toISOString().split('T')[0],
      endDate: newFundraiser.endDate,
      status: 'active',
      contributors: 0
    };

    const updatedFundraisers = [...fundraisers, fundraiser];
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    
    toast.success('Fundraiser created successfully!');
    setShowAddFundraiserDialog(false);
    setNewFundraiser({
      title: '',
      beneficiary: '',
      story: '',
      goalAmount: '',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      endDate: ''
    });
  };

  const handleDeleteFundraiser = (id) => {
    const updatedFundraisers = fundraisers.filter(f => f.id !== id);
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser deleted successfully');
  };

  const handleToggleFundraiserStatus = (id) => {
    const updatedFundraisers = fundraisers.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'active' ? 'closed' : 'active' };
      }
      return f;
    });
    setFundraisers(updatedFundraisers);
    localStorage.setItem('fundraisers', JSON.stringify(updatedFundraisers));
    toast.success('Fundraiser status updated');
  };

  const handleEditContract = (type) => {
    setEditingContract({
      type: type,
      text: contractTemplates[type] || defaultContractTemplates[type]
    });
    setShowEditContractDialog(true);
  };

  const handleSaveContract = () => {
    if (!editingContract.text.trim()) {
      toast.error('Contract cannot be empty');
      return;
    }

    const updatedTemplates = {
      ...contractTemplates,
      [editingContract.type]: editingContract.text
    };
    setContractTemplates(updatedTemplates);
    localStorage.setItem('contractTemplates', JSON.stringify(updatedTemplates));
    
    toast.success('Contract template updated successfully!');
    setShowEditContractDialog(false);
    setEditingContract(null);
  };

  const handleMarkEmergencyContacted = (id) => {
    const updatedRequests = emergencyRequests.map(req => {
      if (req.id === id) {
        return { ...req, status: 'contacted' };
      }
      return req;
    });
    setEmergencyRequests(updatedRequests);
    localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
    toast.success('Marked as contacted');
  };

  const handleMarkEmergencyResolved = (id) => {
    const updatedRequests = emergencyRequests.map(req => {
      if (req.id === id) {
        return { ...req, status: 'resolved' };
      }
      return req;
    });
    setEmergencyRequests(updatedRequests);
    localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
    toast.success('Marked as resolved');
  };

  // Service management handlers
  const handleAddService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    const service = {
      id: Date.now(),
      ...newService,
      price: parseFloat(newService.price),
      deposit: newService.paymentType === 'deposit' ? parseFloat(newService.deposit) : 0
    };

    const updatedServices = [...services, service];
    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service added successfully!');
    setShowAddServiceDialog(false);
    setNewService({ name: '', duration: '', price: '', description: '', paymentType: 'full', deposit: '' });
  };

  const handleDeleteService = (id) => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service deleted successfully');
  };

  // Retreat management handlers
  const handleAddRetreat = () => {
    if (!newRetreat.name || !newRetreat.location || !newRetreat.price || !newRetreat.dates) {
      toast.error('Please fill in all required fields');
      return;
    }

    const retreat = {
      id: Date.now(),
      ...newRetreat,
      price: parseFloat(newRetreat.price),
      capacity: parseInt(newRetreat.capacity) || 20,
      spotsLeft: parseInt(newRetreat.capacity) || 20,
      includes: ['Accommodations', 'All Meals', 'Guided Sessions', 'Activities'],
      paymentOptions: [
        { id: 'full', label: 'Pay in Full', amount: parseFloat(newRetreat.price), description: 'One-time payment' },
        { id: 'deposit', label: 'Deposit', amount: parseFloat(newRetreat.price) * 0.3, description: `Pay 30% now, rest later` },
        { id: '50-50', label: '50/50 Split', amount: parseFloat(newRetreat.price) / 2, description: 'Pay half now, half later' }
      ]
    };

    const updatedRetreats = [...retreats, retreat];
    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat added successfully!');
    setShowAddRetreatDialog(false);
    setNewRetreat({
      name: '', location: '', duration: '', dates: '', price: '', description: '', capacity: '',
      image: 'https://images.pexels.com/photos/35439440/pexels-photo-35439440.jpeg'
    });
  };

  const handleDeleteRetreat = (id) => {
    const updatedRetreats = retreats.filter(r => r.id !== id);
    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat deleted successfully');
  };

  // Community post handlers
  const handleDeletePost = (id) => {
    const updatedPosts = communityPosts.filter(p => p.id !== id);
    setCommunityPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    toast.success('Post deleted successfully');
  };

  // Appointment management handlers
  const handleApproveAppointment = (id) => {
    const updatedAppointments = userAppointments.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: 'approved' };
      }
      return apt;
    });
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment approved');
  };

  const handleDenyAppointment = (id) => {
    const updatedAppointments = userAppointments.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: 'denied' };
      }
      return apt;
    });
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment denied');
  };

  const handleDeleteAppointment = (id) => {
    const updatedAppointments = userAppointments.filter(apt => apt.id !== id);
    setUserAppointments(updatedAppointments);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
    toast.success('Appointment deleted');
  };

  // Service editing handlers
  const handleEditService = (service) => {
    setEditingService({ ...service });
    setShowEditServiceDialog(true);
  };

  const handleSaveEditedService = () => {
    if (!editingService.name || !editingService.price || !editingService.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedServices = services.map(s => {
      if (s.id === editingService.id) {
        return {
          ...editingService,
          price: parseFloat(editingService.price),
          deposit: editingService.paymentType === 'deposit' ? parseFloat(editingService.deposit) : 0
        };
      }
      return s;
    });

    setServices(updatedServices);
    localStorage.setItem('adminServices', JSON.stringify(updatedServices));
    toast.success('Service updated successfully');
    setShowEditServiceDialog(false);
    setEditingService(null);
  };

  // Retreat editing handlers
  const handleEditRetreat = (retreat) => {
    setEditingRetreat({ ...retreat });
    setShowEditRetreatDialog(true);
  };

  const handleSaveEditedRetreat = () => {
    if (!editingRetreat.name || !editingRetreat.location || !editingRetreat.price || !editingRetreat.dates) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedRetreats = retreats.map(r => {
      if (r.id === editingRetreat.id) {
        return {
          ...editingRetreat,
          price: parseFloat(editingRetreat.price),
          capacity: parseInt(editingRetreat.capacity) || 20,
        };
      }
      return r;
    });

    setRetreats(updatedRetreats);
    localStorage.setItem('adminRetreats', JSON.stringify(updatedRetreats));
    toast.success('Retreat updated successfully');
    setShowEditRetreatDialog(false);
    setEditingRetreat(null);
  };

  // Settings handlers
  const handleSaveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    toast.success('Settings saved successfully');
    setShowSettingsDialog(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not admin (will redirect via useEffect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your wellness platform</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowSettingsDialog(true)}
            data-testid="admin-settings-btn"
            className="hover:bg-primary/10"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                onClick={() => setActiveTab(stat.tab)}
                data-testid={`stat-card-${stat.tab}`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="retreats">Retreats</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Products</CardTitle>
                    <CardDescription>Manage your product catalog</CardDescription>
                  </div>
                  <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add New Product</DialogTitle>
                        <DialogDescription>
                          Create a new product in your catalog
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Product Name</Label>
                          <Input
                            id="productName"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="e.g., Lavender Calm Tea"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="19.99"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="teas">Teas</option>
                            <option value="tinctures">Tinctures</option>
                            <option value="oils">Oils</option>
                            <option value="books">Books</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-dark">
                          Add Product
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No products created yet. Click "Add Product" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{product.category}</Badge>
                          </TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{product.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                                data-testid={`edit-product-${product.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Appointment Services</CardTitle>
                    <CardDescription>Manage your service offerings</CardDescription>
                  </div>
                  <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add New Service</DialogTitle>
                        <DialogDescription>Create a new appointment service</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceName">Service Name *</Label>
                          <Input
                            id="serviceName"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            placeholder="e.g., Energy Healing Session"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration *</Label>
                            <Input
                              id="duration"
                              value={newService.duration}
                              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                              placeholder="60 min"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="servicePrice">Price ($) *</Label>
                            <Input
                              id="servicePrice"
                              type="number"
                              value={newService.price}
                              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                              placeholder="85"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serviceDesc">Description</Label>
                          <Textarea
                            id="serviceDesc"
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            placeholder="Service description..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <select
                            value={newService.paymentType}
                            onChange={(e) => setNewService({ ...newService, paymentType: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="full">Full Payment</option>
                            <option value="deposit">Deposit Required</option>
                          </select>
                        </div>
                        {newService.paymentType === 'deposit' && (
                          <div className="space-y-2">
                            <Label htmlFor="deposit">Deposit Amount ($)</Label>
                            <Input
                              id="deposit"
                              type="number"
                              value={newService.deposit}
                              onChange={(e) => setNewService({ ...newService, deposit: e.target.value })}
                              placeholder="50"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddService} className="bg-primary hover:bg-primary-dark">Add Service</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No services created yet. Click "Add Service" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Payment Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{service.duration}</TableCell>
                          <TableCell>${service.price}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {service.paymentType === 'deposit' ? `Deposit $${service.deposit}` : 'Full'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditService(service)}
                                data-testid={`edit-service-${service.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteService(service.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-service-${service.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Wellness Classes</CardTitle>
                    <CardDescription>Manage your class offerings</CardDescription>
                  </div>
                  <Dialog open={showAddClassDialog} onOpenChange={setShowAddClassDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add New Class</DialogTitle>
                        <DialogDescription>Create a new wellness class</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="className">Class Name *</Label>
                          <Input
                            id="className"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            placeholder="e.g., Herbal Medicine Basics"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor">Instructor</Label>
                          <Input
                            id="instructor"
                            value={newClass.instructor}
                            onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                            placeholder="Instructor name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="classDuration">Duration</Label>
                            <Input
                              id="classDuration"
                              value={newClass.duration}
                              onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                              placeholder="2 hours"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sessions">Sessions</Label>
                            <Input
                              id="sessions"
                              type="number"
                              value={newClass.sessions}
                              onChange={(e) => setNewClass({ ...newClass, sessions: e.target.value })}
                              placeholder="6"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="classPrice">Price ($) *</Label>
                            <Input
                              id="classPrice"
                              type="number"
                              value={newClass.price}
                              onChange={(e) => setNewClass({ ...newClass, price: e.target.value })}
                              placeholder="199"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="spots">Available Spots</Label>
                            <Input
                              id="spots"
                              type="number"
                              value={newClass.spots}
                              onChange={(e) => setNewClass({ ...newClass, spots: e.target.value })}
                              placeholder="15"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule">Schedule</Label>
                          <Input
                            id="schedule"
                            value={newClass.schedule}
                            onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                            placeholder="Saturdays, 10 AM - 12 PM"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Level</Label>
                          <select
                            id="level"
                            value={newClass.level}
                            onChange={(e) => setNewClass({ ...newClass, level: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="All Levels">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="classDesc">Description</Label>
                          <Textarea
                            id="classDesc"
                            value={newClass.description}
                            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                            placeholder="Class description..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddClassDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddClass} className="bg-primary hover:bg-primary-dark">Add Class</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No classes created yet. Click "Add Class" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Spots</TableHead>
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
                          <TableCell>{classItem.spots || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClass(classItem)}
                                data-testid={`edit-class-${classItem.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClass(classItem.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-class-${classItem.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retreats Tab */}
          <TabsContent value="retreats" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Retreat Management</CardTitle>
                    <CardDescription>Manage retreat offerings and bookings</CardDescription>
                  </div>
                  <Dialog open={showAddRetreatDialog} onOpenChange={setShowAddRetreatDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Retreat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Add New Retreat</DialogTitle>
                        <DialogDescription>Create a new retreat offering</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="retreatName">Retreat Name *</Label>
                          <Input
                            id="retreatName"
                            value={newRetreat.name}
                            onChange={(e) => setNewRetreat({ ...newRetreat, name: e.target.value })}
                            placeholder="e.g., Mountain Meditation Retreat"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              value={newRetreat.location}
                              onChange={(e) => setNewRetreat({ ...newRetreat, location: e.target.value })}
                              placeholder="Blue Ridge Mountains, NC"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="retreatDuration">Duration *</Label>
                            <Input
                              id="retreatDuration"
                              value={newRetreat.duration}
                              onChange={(e) => setNewRetreat({ ...newRetreat, duration: e.target.value })}
                              placeholder="3 days / 2 nights"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dates">Dates *</Label>
                            <Input
                              id="dates"
                              value={newRetreat.dates}
                              onChange={(e) => setNewRetreat({ ...newRetreat, dates: e.target.value })}
                              placeholder="June 15-17, 2024"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="retreatPrice">Price ($) *</Label>
                            <Input
                              id="retreatPrice"
                              type="number"
                              value={newRetreat.price}
                              onChange={(e) => setNewRetreat({ ...newRetreat, price: e.target.value })}
                              placeholder="899"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity (max participants)</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={newRetreat.capacity}
                            onChange={(e) => setNewRetreat({ ...newRetreat, capacity: e.target.value })}
                            placeholder="20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retreatDesc">Description</Label>
                          <Textarea
                            id="retreatDesc"
                            value={newRetreat.description}
                            onChange={(e) => setNewRetreat({ ...newRetreat, description: e.target.value })}
                            placeholder="Retreat description..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={newRetreat.image}
                            onChange={(e) => setNewRetreat({ ...newRetreat, image: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddRetreatDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddRetreat} className="bg-primary hover:bg-primary-dark">Add Retreat</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {retreats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No retreats created yet. Click "Add Retreat" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Retreat Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retreats.map((retreat) => (
                        <TableRow key={retreat.id}>
                          <TableCell className="font-medium">{retreat.name}</TableCell>
                          <TableCell>{retreat.location}</TableCell>
                          <TableCell>{retreat.dates}</TableCell>
                          <TableCell>${retreat.price}</TableCell>
                          <TableCell>{retreat.spotsLeft}/{retreat.capacity}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRetreat(retreat)}
                                data-testid={`edit-retreat-${retreat.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRetreat(retreat.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-retreat-${retreat.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Recent Orders</CardTitle>
                <CardDescription>Manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === 'Delivered' ? 'default' : 'outline'}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Appointment Management</CardTitle>
                <CardDescription>View and manage client bookings ({userAppointments.length} total)</CardDescription>
              </CardHeader>
              <CardContent>
                {userAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No appointments booked yet. Appointments will appear here when clients book.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userAppointments.map((apt) => (
                        <TableRow key={apt.id}>
                          <TableCell className="font-medium">{apt.clientName || apt.userId}</TableCell>
                          <TableCell>{apt.service}</TableCell>
                          <TableCell>{apt.date}</TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                apt.status === 'approved' ? 'default' : 
                                apt.status === 'denied' ? 'destructive' : 
                                'outline'
                              }
                            >
                              {apt.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {apt.status !== 'approved' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApproveAppointment(apt.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve"
                                  data-testid={`approve-apt-${apt.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {apt.status !== 'denied' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDenyAppointment(apt.id)}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  title="Deny"
                                  data-testid={`deny-apt-${apt.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete"
                                data-testid={`delete-apt-${apt.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl text-destructive">Emergency Crisis Requests</CardTitle>
                    <CardDescription>
                      Immediate support requests - {emergencyRequests.filter(r => r.status === 'pending').length} pending
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    {emergencyRequests.filter(r => r.status === 'pending').length} Urgent
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No emergency requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencyRequests.map((request) => (
                      <Card 
                        key={request.id} 
                        className={`${
                          request.priority === 'critical' 
                            ? 'border-destructive border-2' 
                            : 'border-warning'
                        } ${
                          request.status === 'resolved' 
                            ? 'opacity-60' 
                            : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <div className="flex items-center space-x-3 mb-2">
                                <CardTitle className="text-xl">{request.name}</CardTitle>
                                {request.priority === 'critical' && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    IMMEDIATE RISK
                                  </Badge>
                                )}
                                <Badge 
                                  variant={
                                    request.status === 'pending' ? 'destructive' :
                                    request.status === 'contacted' ? 'default' : 
                                    'outline'
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Phone:</span>
                                  <a href={`tel:${request.phone}`} className="font-bold text-destructive ml-2 hover:underline">
                                    {request.phone}
                                  </a>
                                </div>
                                {request.email && (
                                  <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <a href={`mailto:${request.email}`} className="ml-2 hover:underline">
                                      {request.email}
                                    </a>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Submitted:</span>
                                  <span className="font-medium ml-2">
                                    {new Date(request.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Immediate Risk:</span>
                                  <span className={`font-bold ml-2 ${request.immediateRisk === 'yes' ? 'text-destructive' : ''}`}>
                                    {request.immediateRisk === 'yes' ? 'YES - CALL 911' : 'No'}
                                  </span>
                                </div>
                              </div>
                              {request.message && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                  <p className="text-sm font-semibold mb-1">Message:</p>
                                  <p className="text-sm">{request.message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex space-x-2">
                          {request.status === 'pending' && (
                            <Button
                              onClick={() => handleMarkEmergencyContacted(request.id)}
                              className="bg-primary hover:bg-primary-dark"
                            >
                              Mark as Contacted
                            </Button>
                          )}
                          {request.status === 'contacted' && (
                            <Button
                              onClick={() => handleMarkEmergencyResolved(request.id)}
                              variant="outline"
                            >
                              Mark as Resolved
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => window.open(`tel:${request.phone}`)}
                          >
                            Call Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Community Posts</CardTitle>
                <CardDescription>Moderate community content ({communityPosts.length} posts)</CardDescription>
              </CardHeader>
              <CardContent>
                {communityPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No community posts yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <Card key={post.id} className="border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <CardTitle className="text-base">{post.author?.name || 'Unknown User'}</CardTitle>
                              <CardDescription className="text-sm">{post.timestamp}</CardDescription>
                              <p className="mt-2 text-sm">{post.content}</p>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {post.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-destructive hover:text-destructive ml-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fundraisers Tab */}
          <TabsContent value="fundraisers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">Fundraisers</CardTitle>
                    <CardDescription>Manage community fundraisers</CardDescription>
                  </div>
                  <Dialog open={showAddFundraiserDialog} onOpenChange={setShowAddFundraiserDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Fundraiser
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Create New Fundraiser</DialogTitle>
                        <DialogDescription>
                          Set up a fundraiser to support a community member in need
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fundraiserTitle">Fundraiser Title *</Label>
                          <Input
                            id="fundraiserTitle"
                            value={newFundraiser.title}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, title: e.target.value })}
                            placeholder="e.g., Support Sarah's Healing Journey"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="beneficiary">Beneficiary Name *</Label>
                          <Input
                            id="beneficiary"
                            value={newFundraiser.beneficiary}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, beneficiary: e.target.value })}
                            placeholder="e.g., Sarah Johnson"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                          <Input
                            id="goalAmount"
                            type="number"
                            value={newFundraiser.goalAmount}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, goalAmount: e.target.value })}
                            placeholder="5000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newFundraiser.endDate}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="story">Story/Description *</Label>
                          <Textarea
                            id="story"
                            value={newFundraiser.story}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, story: e.target.value })}
                            placeholder="Share the beneficiary's story and how funds will help..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL (optional)</Label>
                          <Input
                            id="imageUrl"
                            value={newFundraiser.image}
                            onChange={(e) => setNewFundraiser({ ...newFundraiser, image: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddFundraiserDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddFundraiser} className="bg-primary hover:bg-primary-dark">
                          Create Fundraiser
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {fundraisers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No fundraisers created yet. Click "Create Fundraiser" to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Raised</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundraisers.map((fundraiser) => (
                        <TableRow key={fundraiser.id}>
                          <TableCell className="font-medium">{fundraiser.title}</TableCell>
                          <TableCell>{fundraiser.beneficiary}</TableCell>
                          <TableCell>${fundraiser.goalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">${fundraiser.raisedAmount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((fundraiser.raisedAmount / fundraiser.goalAmount) * 100)}% funded
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={fundraiser.status === 'active' ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleToggleFundraiserStatus(fundraiser.id)}
                            >
                              {fundraiser.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{fundraiser.endDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFundraiser(fundraiser.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contract Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Contract Templates</CardTitle>
                  <CardDescription>Edit your booking agreement templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Appointment Contract</CardTitle>
                      <CardDescription>Used for all appointment bookings</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEditContract('appointment')}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-secondary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Retreat Contract</CardTitle>
                      <CardDescription>Used for all retreat bookings</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEditContract('retreat')}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>

              {/* Signed Contracts */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Signed Contracts</CardTitle>
                  <CardDescription>View all client agreements ({signedContracts.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  {signedContracts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No signed contracts yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {signedContracts.slice().reverse().map((contract) => (
                        <Card key={contract.id} className="border-border/50">
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm capitalize">{contract.type} Contract</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  Signed: {new Date(contract.signedDate).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contract.bookingDetails.service || contract.bookingDetails.retreat}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Contract Dialog */}
            <Dialog open={showEditContractDialog} onOpenChange={setShowEditContractDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">
                    Edit {editingContract?.type === 'appointment' ? 'Appointment' : 'Retreat'} Contract
                  </DialogTitle>
                  <DialogDescription>
                    This contract will be shown to clients before they complete their booking
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="contractText" className="text-base font-semibold mb-2 block">
                    Contract Text
                  </Label>
                  <Textarea
                    id="contractText"
                    value={editingContract?.text || ''}
                    onChange={(e) => setEditingContract({ ...editingContract, text: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Enter your contract terms..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Use clear language and include cancellation policy, payment terms, and liability information
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditContractDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContract} className="bg-primary hover:bg-primary-dark">
                    Save Contract Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-2xl">User Management</CardTitle>
                    <CardDescription>Manage community members and send emails ({usersList.length} users)</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const users = localStorage.getItem('registeredUsers');
                        if (users) {
                          const parsedUsers = JSON.parse(users);
                          setUsersList(parsedUsers);
                          setRegisteredUsers(parsedUsers.length);
                          syncUsersToBackend(parsedUsers);
                          toast.success('User list refreshed');
                        }
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                    <Dialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary-dark" disabled={usersList.length === 0}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Bulk Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-heading">Send Bulk Email</DialogTitle>
                          <DialogDescription>
                            Send an email to all {usersList.length} registered users
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="bulkSubject">Subject *</Label>
                            <Input
                              id="bulkSubject"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              placeholder="e.g., Exciting News from Mother Natural!"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bulkContent">Message *</Label>
                            <Textarea
                              id="bulkContent"
                              value={emailContent}
                              onChange={(e) => setEmailContent(e.target.value)}
                              placeholder="Write your message here..."
                              rows={10}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowBulkEmailDialog(false)}>Cancel</Button>
                          <Button 
                            onClick={handleSendBulkEmail} 
                            className="bg-primary hover:bg-primary-dark"
                            disabled={isSendingEmail}
                          >
                            {isSendingEmail ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send to {usersList.length} Users
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No registered users yet.</p>
                    <p className="text-sm">Users will appear here when they sign up.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">{userItem.name}</TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            {userItem.joinedDate 
                              ? new Date(userItem.joinedDate).toLocaleDateString() 
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEmailDialogForUser(userItem)}
                              data-testid={`email-user-${userItem.id}`}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Email History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-xl">Email History</CardTitle>
                    <CardDescription>Recent emails sent from admin panel</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fetchEmailLogs}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emailLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No emails sent yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={log.type === 'bulk' ? 'default' : 'outline'}>
                              {log.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                          <TableCell>
                            {log.type === 'bulk' 
                              ? `${log.sent_count}/${log.recipient_count}` 
                              : log.recipient}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(log.sent_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Personal Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading">Send Email to {selectedUserForEmail?.name}</DialogTitle>
              <DialogDescription>
                Sending to: {selectedUserForEmail?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="personalSubject">Subject *</Label>
                <Input
                  id="personalSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., Your Appointment Confirmation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalContent">Message *</Label>
                <Textarea
                  id="personalContent"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Write your personal message here..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleSendPersonalEmail} 
                className="bg-primary hover:bg-primary-dark"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Admin Settings</DialogTitle>
              <DialogDescription>Configure your platform settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={adminSettings.businessName}
                  onChange={(e) => setAdminSettings({ ...adminSettings, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={adminSettings.contactEmail}
                  onChange={(e) => setAdminSettings({ ...adminSettings, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={adminSettings.contactPhone}
                  onChange={(e) => setAdminSettings({ ...adminSettings, contactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Email Notifications</Label>
                <input
                  id="notifications"
                  type="checkbox"
                  checked={adminSettings.notificationsEnabled}
                  onChange={(e) => setAdminSettings({ ...adminSettings, notificationsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary-dark">Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Service Dialog */}
        <Dialog open={showEditServiceDialog} onOpenChange={setShowEditServiceDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit Service</DialogTitle>
              <DialogDescription>Update service details</DialogDescription>
            </DialogHeader>
            {editingService && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editServiceName">Service Name *</Label>
                  <Input
                    id="editServiceName"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDuration">Duration *</Label>
                    <Input
                      id="editDuration"
                      value={editingService.duration}
                      onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editServicePrice">Price ($) *</Label>
                    <Input
                      id="editServicePrice"
                      type="number"
                      value={editingService.price}
                      onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editServiceDesc">Description</Label>
                  <Textarea
                    id="editServiceDesc"
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <select
                    value={editingService.paymentType || 'full'}
                    onChange={(e) => setEditingService({ ...editingService, paymentType: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="full">Full Payment</option>
                    <option value="deposit">Deposit Required</option>
                  </select>
                </div>
                {editingService.paymentType === 'deposit' && (
                  <div className="space-y-2">
                    <Label htmlFor="editDeposit">Deposit Amount ($)</Label>
                    <Input
                      id="editDeposit"
                      type="number"
                      value={editingService.deposit || ''}
                      onChange={(e) => setEditingService({ ...editingService, deposit: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditServiceDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditedService} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Retreat Dialog */}
        <Dialog open={showEditRetreatDialog} onOpenChange={setShowEditRetreatDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit Retreat</DialogTitle>
              <DialogDescription>Update retreat details</DialogDescription>
            </DialogHeader>
            {editingRetreat && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editRetreatName">Retreat Name *</Label>
                  <Input
                    id="editRetreatName"
                    value={editingRetreat.name}
                    onChange={(e) => setEditingRetreat({ ...editingRetreat, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editLocation">Location *</Label>
                    <Input
                      id="editLocation"
                      value={editingRetreat.location}
                      onChange={(e) => setEditingRetreat({ ...editingRetreat, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRetreatDuration">Duration</Label>
                    <Input
                      id="editRetreatDuration"
                      value={editingRetreat.duration || ''}
                      onChange={(e) => setEditingRetreat({ ...editingRetreat, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDates">Dates *</Label>
                    <Input
                      id="editDates"
                      value={editingRetreat.dates}
                      onChange={(e) => setEditingRetreat({ ...editingRetreat, dates: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRetreatPrice">Price ($) *</Label>
                    <Input
                      id="editRetreatPrice"
                      type="number"
                      value={editingRetreat.price}
                      onChange={(e) => setEditingRetreat({ ...editingRetreat, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCapacity">Capacity</Label>
                  <Input
                    id="editCapacity"
                    type="number"
                    value={editingRetreat.capacity || ''}
                    onChange={(e) => setEditingRetreat({ ...editingRetreat, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRetreatDesc">Description</Label>
                  <Textarea
                    id="editRetreatDesc"
                    value={editingRetreat.description || ''}
                    onChange={(e) => setEditingRetreat({ ...editingRetreat, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editImageUrl">Image URL</Label>
                  <Input
                    id="editImageUrl"
                    value={editingRetreat.image || ''}
                    onChange={(e) => setEditingRetreat({ ...editingRetreat, image: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRetreatDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditedRetreat} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit Product</DialogTitle>
              <DialogDescription>Update product details</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editProductName">Product Name *</Label>
                  <Input
                    id="editProductName"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProductPrice">Price ($) *</Label>
                  <Input
                    id="editProductPrice"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProductCategory">Category</Label>
                  <select
                    id="editProductCategory"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="teas">Teas</option>
                    <option value="tinctures">Tinctures</option>
                    <option value="oils">Oils</option>
                    <option value="books">Books</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProductDesc">Description</Label>
                  <Textarea
                    id="editProductDesc"
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditedProduct} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  <Input
                    id="editClassName"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClassInstructor">Instructor</Label>
                  <Input
                    id="editClassInstructor"
                    value={editingClass.instructor || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, instructor: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editClassDuration">Duration</Label>
                    <Input
                      id="editClassDuration"
                      value={editingClass.duration || ''}
                      onChange={(e) => setEditingClass({ ...editingClass, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editClassSessions">Sessions</Label>
                    <Input
                      id="editClassSessions"
                      type="number"
                      value={editingClass.sessions || ''}
                      onChange={(e) => setEditingClass({ ...editingClass, sessions: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editClassPrice">Price ($) *</Label>
                    <Input
                      id="editClassPrice"
                      type="number"
                      value={editingClass.price}
                      onChange={(e) => setEditingClass({ ...editingClass, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editClassSpots">Available Spots</Label>
                    <Input
                      id="editClassSpots"
                      type="number"
                      value={editingClass.spots || ''}
                      onChange={(e) => setEditingClass({ ...editingClass, spots: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClassSchedule">Schedule</Label>
                  <Input
                    id="editClassSchedule"
                    value={editingClass.schedule || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, schedule: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClassLevel">Level</Label>
                  <select
                    id="editClassLevel"
                    value={editingClass.level || 'All Levels'}
                    onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClassDesc">Description</Label>
                  <Textarea
                    id="editClassDesc"
                    value={editingClass.description || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditClassDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditedClass} className="bg-primary hover:bg-primary-dark">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pre-configured admin account
  const ADMIN_CREDENTIALS = {
    email: 'admin@mothernatural.com',
    password: 'Aniyah13',
    userData: {
      id: 'admin-001',
      name: 'Administrator',
      email: 'admin@mothernatural.com',
      role: 'admin',
      membershipLevel: 'platinum',
      joinedDate: new Date().toISOString()
    }
  };

  useEffect(() => {
    // Check localStorage for user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check if it's the admin account
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser(ADMIN_CREDENTIALS.userData);
      localStorage.setItem('user', JSON.stringify(ADMIN_CREDENTIALS.userData));
      return ADMIN_CREDENTIALS.userData;
    }
    
    // Regular user login (mock)
    const mockUser = {
      id: Date.now().toString(),
      name: 'User Name',
      email: email,
      role: 'user',
      membershipLevel: 'basic',
      joinedDate: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  };

  const signup = (name, email, password) => {
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: 'user',
      membershipLevel: 'basic',
      joinedDate: new Date().toISOString()
    };
    
    // Save to registered users list
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    // Check if email already exists
    const emailExists = existingUsers.some(u => u.email === email);
    if (!emailExists) {
      existingUsers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        joinedDate: newUser.joinedDate
      });
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    }
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

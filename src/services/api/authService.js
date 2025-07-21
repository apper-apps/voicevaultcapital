import { userService } from './userService';

// Mock authentication service with localStorage session management
class AuthService {
  constructor() {
    this.storageKey = 'voicevault_session';
    this.users = [
      {
        Id: 1,
        email: 'demo@voicevault.ai',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
        avatar: null,
        createdAt: new Date('2024-01-01').toISOString(),
        lastLoginAt: null
      }
    ];
  }

  async login(email, password) {
    await this.delay(500);

    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const sessionToken = this.generateToken();
    const userData = { ...user };
    delete userData.password;
    
    // Update last login
    userData.lastLoginAt = new Date().toISOString();

    const session = {
      token: sessionToken,
      user: userData,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));

    return {
      user: userData,
      token: sessionToken
    };
  }

  async register(userData) {
    await this.delay(800);

    const existingUser = this.users.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      Id: Math.max(...this.users.map(u => u.Id), 0) + 1,
      email: userData.email.toLowerCase(),
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.users.push(newUser);

    const sessionToken = this.generateToken();
    const userResponse = { ...newUser };
    delete userResponse.password;

    const session = {
      token: sessionToken,
      user: userResponse,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));

    return {
      user: userResponse,
      token: sessionToken
    };
  }

  async loginWithGoogle(googleToken) {
    await this.delay(600);

    // Simulate Google OAuth user data
    const googleUserData = {
      email: `google.user+${Date.now()}@gmail.com`,
      firstName: 'Google',
      lastName: 'User',
      avatar: `https://ui-avatars.com/api/?name=Google+User&background=5B68E8&color=fff`
    };

    // Check if user exists
    let user = this.users.find(u => u.email.toLowerCase() === googleUserData.email.toLowerCase());

    if (!user) {
      // Create new user from Google data
      user = {
        Id: Math.max(...this.users.map(u => u.Id), 0) + 1,
        email: googleUserData.email.toLowerCase(),
        password: null, // No password for OAuth users
        firstName: googleUserData.firstName,
        lastName: googleUserData.lastName,
        avatar: googleUserData.avatar,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.users.push(user);
    }

    const sessionToken = this.generateToken();
    const userData = { ...user };
    delete userData.password;
    
    userData.lastLoginAt = new Date().toISOString();

    const session = {
      token: sessionToken,
      user: userData,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));

    return {
      user: userData,
      token: sessionToken
    };
  }

  async logout() {
    await this.delay(200);
    localStorage.removeItem(this.storageKey);
  }

  getCurrentSession() {
    try {
      const sessionData = localStorage.getItem(this.storageKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      this.clearSession();
      return null;
    }
  }

  async validateSession(token) {
    await this.delay(300);

    const session = this.getCurrentSession();
    if (!session || session.token !== token) {
      return null;
    }

    return session.user;
  }

  clearSession() {
    localStorage.removeItem(this.storageKey);
  }

  async updateProfile(updates) {
    await this.delay(500);

    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session');
    }

    const userIndex = this.users.findIndex(u => u.Id === session.user.Id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      Id: session.user.Id, // Prevent ID changes
      email: session.user.email // Prevent email changes in this demo
    };

    const updatedUser = { ...this.users[userIndex] };
    delete updatedUser.password;

    // Update session
    session.user = updatedUser;
    localStorage.setItem(this.storageKey, JSON.stringify(session));

    return updatedUser;
  }

  generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Admin methods for demo purposes
  getAllUsers() {
    return this.users.map(user => {
      const userCopy = { ...user };
      delete userCopy.password;
      return userCopy;
    });
  }

  resetUsers() {
    this.users = [
      {
        Id: 1,
        email: 'demo@voicevault.ai',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
        avatar: null,
        createdAt: new Date('2024-01-01').toISOString(),
        lastLoginAt: null
      }
    ];
  }
}

export const authService = new AuthService();
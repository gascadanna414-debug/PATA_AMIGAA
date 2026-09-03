import { User, UserRole } from '../types';
import { isValidPhone10, sanitizePhone10 } from '../utils/phoneUtils';

const AUTH_USER_KEY = 'pata_amiga_current_user';
const USERS_DB_KEY = 'pata_amiga_registered_users';
const RECOVERY_CODES_KEY = 'pata_amiga_recovery_codes';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'gascadanna414@gmail.com'
];

// Initial default user accounts with the single authorized administrator
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user-admin-1',
    name: 'Danna Gascá',
    email: 'gascadanna414@gmail.com',
    role: 'admin',
    phone: '+57 312 890 4521',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-10',
    registeredAt: '10 Ene 2024',
    passwordHash: 'DannaGasca180610'
  },
  {
    id: 'user-admin-2',
    name: 'Dra. Sofía Ruiz',
    email: 'sofia.rescate@pataamiga.org',
    role: 'veterinario',
    phone: '+57 314 772 1093',
    location: 'Barrio El Ospina Pérez, Purificación',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-01',
    registeredAt: '01 Ene 2024',
    passwordHash: '123456'
  },
  {
    id: 'user-demo-3',
    name: 'Carlos Méndez',
    email: 'carlos.voluntario@gmail.com',
    role: 'voluntario',
    phone: '+57 310 445 8892',
    location: 'Barrio Santander, Purificación',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-02-15',
    registeredAt: '15 Feb 2024',
    passwordHash: '123456'
  },
  {
    id: 'user-demo-4',
    name: 'Mariana Gómez',
    email: 'mariana.gomez@gmail.com',
    role: 'ciudadano',
    phone: '+57 315 670 9922',
    location: 'Barrio Camilo Torres, Purificación',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-03-01',
    registeredAt: '01 Mar 2024',
    passwordHash: '123456'
  }
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: StoredUser[] = JSON.parse(raw);
    let updated = false;

    // Strict rule: ONLY gascadanna414@gmail.com can have the admin role, and her password must be DannaGasca180610
    parsed.forEach(u => {
      if (u.email.toLowerCase() === 'gascadanna414@gmail.com') {
        if (u.role !== 'admin') {
          u.role = 'admin';
          updated = true;
        }
        if (u.passwordHash !== 'DannaGasca180610') {
          u.passwordHash = 'DannaGasca180610';
          updated = true;
        }
      } else {
        // Demote any other user if they have the admin role
        if (u.role === 'admin') {
          u.role = u.email.toLowerCase() === 'sofia.rescate@pataamiga.org' ? 'veterinario' : 'voluntario';
          updated = true;
        }
      }
    });

    // Ensure Dra. Sofia exists in users list if not present
    if (!parsed.some(u => u.email.toLowerCase() === 'sofia.rescate@pataamiga.org')) {
      parsed.push(DEFAULT_USERS[1]);
      updated = true;
    }
    // Ensure Danna Gascá exists in users list if not present
    if (!parsed.some(u => u.email.toLowerCase() === 'gascadanna414@gmail.com')) {
      parsed.unshift(DEFAULT_USERS[0]);
      updated = true;
    }
    if (updated) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export const AuthController = {
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      const user: User = JSON.parse(raw);
      if (user.email.toLowerCase() === 'gascadanna414@gmail.com') {
        if (user.role !== 'admin') {
          user.role = 'admin';
          this.setCurrentUser(user);
        }
      } else if (user.role === 'admin') {
        user.role = 'voluntario';
        this.setCurrentUser(user);
      }
      return user;
    } catch {
      return null;
    }
  },

  isAdmin(user?: User | null): boolean {
    const target = user || this.getCurrentUser();
    if (!target) return false;
    return target.email.toLowerCase() === 'gascadanna414@gmail.com' && target.role === 'admin';
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      if (user.email.toLowerCase() === 'gascadanna414@gmail.com') {
        user.role = 'admin';
      } else if (user.role === 'admin') {
        user.role = 'voluntario';
      }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    window.dispatchEvent(new Event('auth-state-change'));
  },

  getAllUsers(): StoredUser[] {
    return getStoredUsers();
  },

  deleteUser(userId: string): boolean {
    const users = getStoredUsers();
    const target = users.find(u => u.id === userId);
    if (target && target.email.toLowerCase() === 'gascadanna414@gmail.com') {
      return false; // Cannot delete primary administrator
    }
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
    window.dispatchEvent(new Event('auth-state-change'));
    window.dispatchEvent(new Event('pata-data-change'));
    return true;
  },

  updateUserRole(userId: string, newRole: UserRole): boolean {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    // Only gascadanna414@gmail.com can be admin
    if (newRole === 'admin' && users[idx].email.toLowerCase() !== 'gascadanna414@gmail.com') {
      return false;
    }
    if (users[idx].email.toLowerCase() === 'gascadanna414@gmail.com' && newRole !== 'admin') {
      return false;
    }
    users[idx].role = newRole;
    saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.role = newRole;
      this.setCurrentUser(currentUser);
    }
    return true;
  },

  login(email: string, password: string): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Auto-restore admin account if not found
    if (!user && cleanEmail === 'gascadanna414@gmail.com') {
      user = {
        id: 'user-admin-1',
        name: 'Danna Gascá',
        email: 'gascadanna414@gmail.com',
        role: 'admin',
        phone: '+57 312 890 4521',
        location: 'Purificación, Tolima',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: '2024-01-10',
        registeredAt: '10 Ene 2024',
        passwordHash: 'DannaGasca180610'
      };
      users.unshift(user);
      saveUsers(users);
    }

    if (!user) {
      return {
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico.'
      };
    }

    // Strict validation for sole administrator (Danna Gascá)
    if (cleanEmail === 'gascadanna414@gmail.com') {
      if (cleanPassword !== 'DannaGasca180610') {
        return {
          success: false,
          message: 'Contraseña de administrador incorrecta. Solo la administradora autorizada puede ingresar.'
        };
      }

      user.passwordHash = 'DannaGasca180610';
      user.role = 'admin';
      saveUsers(users);

      const { passwordHash: _, ...publicUser } = user;
      publicUser.role = 'admin';
      this.setCurrentUser(publicUser);
      return {
        success: true,
        message: `¡Bienvenida Administradora, ${publicUser.name}! Has iniciado sesión correctamente.`,
        user: publicUser
      };
    }

    if (user.passwordHash !== password && user.passwordHash !== cleanPassword) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Por favor verifica tus datos o usa la opción "¿Olvidaste tu contraseña?".'
      };
    }

    // Normal users never receive admin role
    if (user.role === 'admin') {
      user.role = 'voluntario';
      saveUsers(users);
    }

    const { passwordHash: _, ...publicUser } = user;
    if (publicUser.role === 'admin') {
      publicUser.role = 'voluntario';
    }
    this.setCurrentUser(publicUser);
    return {
      success: true,
      message: `¡Bienvenido(a) de nuevo, ${publicUser.name}!`,
      user: publicUser
    };
  },

  register(data: { name: string; email: string; password: string; phone?: string; role?: UserRole }): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (cleanEmail === 'gascadanna414@gmail.com') {
      return {
        success: false,
        message: 'Este correo electrónico no está disponible para registro público.'
      };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.'
      };
    }

    if (data.password.length < 4) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 4 caracteres.'
      };
    }

    const assignedRole: UserRole = data.role === 'admin' ? 'voluntario' : (data.role || 'ciudadano');
    const sanitizedPhone = data.phone ? data.phone.trim() : '';

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: assignedRole,
      phone: sanitizedPhone,
      location: 'Purificación, Tolima',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      passwordHash: data.password.trim()
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = newUser;
    this.setCurrentUser(publicUser);

    return {
      success: true,
      message: '¡Cuenta creada con éxito! Bienvenido(a) a la comunidad de Pata Amiga Purificación.',
      user: publicUser
    };
  },

  createUserByAdmin(data: { name: string; email: string; phone: string; role: UserRole; password?: string }): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!data.name || !cleanEmail || !data.phone) {
      return {
        success: false,
        message: 'Nombre, correo electrónico y teléfono son obligatorios.'
      };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Ya existe un usuario registrado con este correo electrónico.'
      };
    }

    const sanitizedPhone = sanitizePhone10(data.phone);
    if (sanitizedPhone.length !== 10) {
      return {
        success: false,
        message: 'El teléfono debe contener exactamente 10 dígitos (ej: 3128904521).'
      };
    }

    // Only gascadanna414@gmail.com can be admin
    const effectiveRole: UserRole = data.role === 'admin' ? 'voluntario' : data.role;

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: effectiveRole,
      phone: sanitizedPhone,
      location: 'Purificación, Tolima',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      passwordHash: data.password || '123456'
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = newUser;
    return {
      success: true,
      message: `Usuario ${newUser.name} registrado con éxito con rol de ${newUser.role.toUpperCase()}.`,
      user: publicUser
    };
  },

  updateUserProfile(userId: string, updates: Partial<User>): boolean {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    if (updates.phone) {
      updates.phone = sanitizePhone10(updates.phone);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates
    };

    saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      const { passwordHash: _, ...publicUser } = users[userIndex];
      this.setCurrentUser(publicUser);
    }

    return true;
  },

  loginAsAdminDemo(): AuthResponse {
    return {
      success: false,
      message: 'Acceso de prueba deshabilitado.'
    };
  },

  requestPasswordReset(email: string): { success: boolean; message: string; simulatedCode?: string } {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'gascadanna414@gmail.com') {
      return {
        success: false,
        message: 'Esta cuenta administrativa está protegida y no permite restablecimiento público.'
      };
    }

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: 'No encontramos ninguna cuenta asociada al correo ingresado.'
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const codes = JSON.parse(localStorage.getItem(RECOVERY_CODES_KEY) || '{}');
      codes[cleanEmail] = { code, expires: Date.now() + 15 * 60 * 1000 };
      localStorage.setItem(RECOVERY_CODES_KEY, JSON.stringify(codes));
    } catch {
      // fallback
    }

    return {
      success: true,
      message: `Hemos generado un código de recuperación para ${cleanEmail}. Úsalo para restablecer tu contraseña.`,
      simulatedCode: code
    };
  },

  resetPasswordWithCode(email: string, code: string, newPassword: string): AuthResponse {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'gascadanna414@gmail.com') {
      return {
        success: false,
        message: 'La cuenta de Administradora principal está protegida y no permite restablecimiento público.'
      };
    }

    let valid = false;

    try {
      const codes = JSON.parse(localStorage.getItem(RECOVERY_CODES_KEY) || '{}');
      const item = codes[cleanEmail];
      if (item && item.code === code.trim() && item.expires > Date.now()) {
        valid = true;
      }
    } catch {
      valid = false;
    }

    // Also accept simple test code 123456
    if (!valid && code.trim() !== '123456') {
      return {
        success: false,
        message: 'El código de seguridad ingresado es incorrecto o ha expirado.'
      };
    }

    if (newPassword.length < 4) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener mínimo 4 caracteres.'
      };
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      return {
        success: false,
        message: 'Usuario no encontrado.'
      };
    }

    users[userIndex].passwordHash = newPassword.trim();
    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
      users[userIndex].role = 'admin';
    }
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = users[userIndex];
    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
      publicUser.role = 'admin';
    }
    this.setCurrentUser(publicUser);

    return {
      success: true,
      message: '¡Contraseña restablecida exitosamente! Has iniciado sesión automáticamente.',
      user: publicUser
    };
  },

  logout(): void {
    this.setCurrentUser(null);
  }
};

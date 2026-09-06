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

export interface AdminCredential {
  password: string;
  name: string;
  phone: string;
  location: string;
  avatar: string;
}

export const AUTHORIZED_ADMIN_CREDENTIALS: Record<string, AdminCredential> = {
  'gascadanna414@gmail.com': {
    password: 'DannaGasca180610',
    name: 'Danna Gascá',
    phone: '+57 312 890 4521',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  'sofiaaa.123791@gmail.com': {
    password: 'S11112009',
    name: 'Sofía Rodríguez',
    phone: '+57 314 772 1093',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  'adrianamacana2@gmail.com': {
    password: 'perezadriana',
    name: 'Adriana Macana',
    phone: '+57 310 556 7812',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  'marimasmela15@gmail.com': {
    password: '22022025onyx',
    name: 'Mari Masmela',
    phone: '+57 311 884 9201',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  }
};

export const AUTHORIZED_ADMIN_EMAILS = Object.keys(AUTHORIZED_ADMIN_CREDENTIALS);

// Initial default user accounts with the authorized administrators
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
    name: 'Sofía Rodríguez',
    email: 'sofiaaa.123791@gmail.com',
    role: 'admin',
    phone: '+57 314 772 1093',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-12',
    registeredAt: '12 Ene 2024',
    passwordHash: 'S11112009'
  },
  {
    id: 'user-admin-3',
    name: 'Adriana Macana',
    email: 'adrianamacana2@gmail.com',
    role: 'admin',
    phone: '+57 310 556 7812',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-15',
    registeredAt: '15 Ene 2024',
    passwordHash: 'perezadriana'
  },
  {
    id: 'user-admin-4',
    name: 'Mari Masmela',
    email: 'marimasmela15@gmail.com',
    role: 'admin',
    phone: '+57 311 884 9201',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-02-22',
    registeredAt: '22 Feb 2024',
    passwordHash: '22022025onyx'
  },
  {
    id: 'user-vet-4',
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
    id: 'user-demo-5',
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
    id: 'user-demo-6',
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

    // Strict rule: ONLY emails in AUTHORIZED_ADMIN_EMAILS can have the admin role
    parsed.forEach(u => {
      const emailLower = u.email.toLowerCase();
      const adminCred = AUTHORIZED_ADMIN_CREDENTIALS[emailLower];
      if (adminCred) {
        if (u.role !== 'admin') {
          u.role = 'admin';
          updated = true;
        }
        if (u.passwordHash !== adminCred.password) {
          u.passwordHash = adminCred.password;
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

    // Ensure all 4 authorized administrators exist in users list
    Object.entries(AUTHORIZED_ADMIN_CREDENTIALS).forEach(([email, cred], idx) => {
      if (!parsed.some(u => u.email.toLowerCase() === email)) {
        parsed.unshift({
          id: `user-admin-${idx + 1}`,
          name: cred.name,
          email: email,
          role: 'admin',
          phone: cred.phone,
          location: cred.location,
          avatar: cred.avatar,
          createdAt: '2024-01-10',
          registeredAt: '10 Ene 2024',
          passwordHash: cred.password
        });
        updated = true;
      }
    });

    // Ensure Dra. Sofia vet exists in users list if not present
    if (!parsed.some(u => u.email.toLowerCase() === 'sofia.rescate@pataamiga.org')) {
      parsed.push(DEFAULT_USERS[3]);
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
      if (AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
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
    return AUTHORIZED_ADMIN_EMAILS.includes(target.email.toLowerCase()) && target.role === 'admin';
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      if (AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
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
    if (target && AUTHORIZED_ADMIN_EMAILS.includes(target.email.toLowerCase())) {
      return false; // Cannot delete authorized administrators
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
    const targetEmail = users[idx].email.toLowerCase();

    // Only authorized emails can be admin
    if (newRole === 'admin' && !AUTHORIZED_ADMIN_EMAILS.includes(targetEmail)) {
      return false;
    }
    // Cannot revoke admin role from authorized administrators
    if (AUTHORIZED_ADMIN_EMAILS.includes(targetEmail) && newRole !== 'admin') {
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
    const adminCred = AUTHORIZED_ADMIN_CREDENTIALS[cleanEmail];
    if (!user && adminCred) {
      user = {
        id: `user-admin-${Date.now()}`,
        name: adminCred.name,
        email: cleanEmail,
        role: 'admin',
        phone: adminCred.phone,
        location: adminCred.location,
        avatar: adminCred.avatar,
        createdAt: '2024-01-10',
        registeredAt: '10 Ene 2024',
        passwordHash: adminCred.password
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

    // Strict validation for authorized administrators
    if (adminCred) {
      if (cleanPassword !== adminCred.password) {
        return {
          success: false,
          message: 'Contraseña de administrador incorrecta. Solo las administradoras autorizadas pueden ingresar.'
        };
      }

      user.passwordHash = adminCred.password;
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

    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
      return {
        success: false,
        message: 'Este correo electrónico está reservado para la administración.'
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
      passwordHash: data.password || '123456'
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = newUser;
    this.setCurrentUser(publicUser);
    return {
      success: true,
      message: `¡Registro exitoso! Te damos la bienvenida a Pata Amiga Purificación, ${newUser.name}.`,
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

    // Only authorized emails can be admin
    const effectiveRole: UserRole = (data.role === 'admin' && !AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail))
      ? 'voluntario'
      : data.role;

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

  updateUserProfile(userId: string, updates: Partial<User> & { password?: string }): { success: boolean; message: string; user?: User } {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado en el sistema.' };
    }

    if (updates.name !== undefined) {
      const cleanName = updates.name.trim();
      if (cleanName.length < 3) {
        return { success: false, message: 'El nombre completo debe tener al menos 3 caracteres.' };
      }
      users[userIndex].name = cleanName;
    }

    if (updates.phone !== undefined) {
      const cleanPhone = sanitizePhone10(updates.phone);
      users[userIndex].phone = cleanPhone;
    }

    if (updates.location !== undefined) {
      users[userIndex].location = updates.location.trim();
    }

    if (updates.avatar !== undefined) {
      users[userIndex].avatar = updates.avatar.trim();
    }

    if (updates.password && updates.password.trim()) {
      if (updates.password.trim().length < 6) {
        return { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres.' };
      }
      users[userIndex].passwordHash = updates.password.trim();
    }

    // Role safety: role cannot be escalated to admin
    if (updates.role && updates.role !== users[userIndex].role) {
      const userEmail = users[userIndex].email.toLowerCase();
      if (updates.role === 'admin' && !AUTHORIZED_ADMIN_EMAILS.includes(userEmail)) {
        // preserve existing role
      } else {
        users[userIndex].role = updates.role;
      }
    }

    saveUsers(users);

    const { passwordHash: _, ...publicUser } = users[userIndex];
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(publicUser);
    }

    window.dispatchEvent(new Event('auth-state-change'));
    window.dispatchEvent(new Event('pata-data-change'));

    return {
      success: true,
      message: '¡Perfil actualizado con éxito!',
      user: publicUser
    };
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

    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
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

    if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
      return {
        success: false,
        message: 'Las cuentas administrativas están protegidas y no permiten restablecimiento público.'
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

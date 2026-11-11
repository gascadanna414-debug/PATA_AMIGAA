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

export const ADMIN_EMAILS_STORAGE_KEY = 'pata_amiga_authorized_admin_emails';

export function getAuthorizedAdminEmails(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_EMAILS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(new Set(parsed.map((e: string) => String(e).trim().toLowerCase())));
      }
    }
  } catch {
    // fallback to initial list
  }
  const initial = Object.keys(AUTHORIZED_ADMIN_CREDENTIALS).map(e => e.toLowerCase());
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveAuthorizedAdminEmails(emails: string[]): void {
  const clean = Array.from(new Set(emails.map(e => e.trim().toLowerCase())));
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(clean));
}

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
    createdAt: '2025-12-01',
    registeredAt: '01 Dic 2025',
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
    createdAt: '2025-12-10',
    registeredAt: '10 Dic 2025',
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
    createdAt: '2025-12-15',
    registeredAt: '15 Dic 2025',
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
    createdAt: '2026-01-10',
    registeredAt: '10 Ene 2026',
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
    createdAt: '2025-12-05',
    registeredAt: '05 Dic 2025',
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
    createdAt: '2026-01-20',
    registeredAt: '20 Ene 2026',
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
    createdAt: '2026-02-15',
    registeredAt: '15 Feb 2026',
    passwordHash: '123456'
  }
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    let adminEmails = getAuthorizedAdminEmails();

    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: StoredUser[] = JSON.parse(raw);
    let updated = false;

    // Dynamically synchronize admin users with admin emails
    parsed.forEach(u => {
      const emailLower = u.email.toLowerCase().trim();
      const adminCred = AUTHORIZED_ADMIN_CREDENTIALS[emailLower];
      
      // If user is designated as admin, register their email in authorized admin emails
      if (u.role === 'admin') {
        if (!adminEmails.includes(emailLower)) {
          adminEmails.push(emailLower);
          updated = true;
        }
      } else if (adminEmails.includes(emailLower)) {
        // If email is in authorized admin emails, ensure their role is admin
        u.role = 'admin';
        updated = true;
      }

      // If user has built-in credentials, ensure password matches
      if (adminCred && u.passwordHash !== adminCred.password) {
        u.passwordHash = adminCred.password;
        updated = true;
      }
    });

    saveAuthorizedAdminEmails(adminEmails);

    // Ensure all 4 root authorized administrators exist in users list
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
          createdAt: '2025-12-01',
          registeredAt: '01 Dic 2025',
          passwordHash: cred.password
        });
        updated = true;
      }
    });

    // Ensure Dra. Sofia vet exists in users list if not present
    if (!parsed.some(u => u.email.toLowerCase() === 'sofia.rescate@pataamiga.org')) {
      const vetUser = DEFAULT_USERS.find(u => u.id === 'user-vet-4');
      if (vetUser) {
        parsed.push(vetUser);
        updated = true;
      }
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
  getAuthorizedAdminEmails(): string[] {
    return getAuthorizedAdminEmails();
  },

  isAuthorizedAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return getAuthorizedAdminEmails().includes(clean);
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      const user: User = JSON.parse(raw);
      const adminEmails = getAuthorizedAdminEmails();
      if (user.role === 'admin' || adminEmails.includes(user.email.toLowerCase())) {
        if (user.role !== 'admin') {
          user.role = 'admin';
          this.setCurrentUser(user);
        }
      }
      return user;
    } catch {
      return null;
    }
  },

  isAdmin(user?: User | null): boolean {
    const target = user || this.getCurrentUser();
    if (!target) return false;
    const adminEmails = getAuthorizedAdminEmails();
    return target.role === 'admin' || adminEmails.includes(target.email.toLowerCase().trim());
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      const adminEmails = getAuthorizedAdminEmails();
      if (user.role === 'admin' || adminEmails.includes(user.email.toLowerCase().trim())) {
        user.role = 'admin';
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

  getAdminUsers(): StoredUser[] {
    return getStoredUsers().filter(u => u.role === 'admin' || this.isAuthorizedAdminEmail(u.email));
  },

  deleteUser(userId: string): boolean {
    const users = getStoredUsers();
    const current = this.getCurrentUser();
    const target = users.find(u => u.id === userId);
    if (!target) return false;

    // Safety: Cannot delete yourself if you are currently logged in
    if (current && current.id === userId) {
      return false;
    }

    // Safety: If deleting an administrator, ensure there is at least 1 other administrator remaining
    if (target.role === 'admin') {
      const activeAdmins = users.filter(u => u.role === 'admin');
      if (activeAdmins.length <= 1) {
        return false;
      }
      const adminEmails = getAuthorizedAdminEmails().filter(e => e !== target.email.toLowerCase().trim());
      saveAuthorizedAdminEmails(adminEmails);
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
    const targetUser = users[idx];
    const targetEmail = targetUser.email.toLowerCase().trim();
    const current = this.getCurrentUser();
    let adminEmails = getAuthorizedAdminEmails();

    // Safety: Cannot revoke admin role from yourself while logged in
    if (current && current.id === userId && targetUser.role === 'admin' && newRole !== 'admin') {
      return false;
    }

    // If revoking admin role, ensure there's at least one other active admin
    if (targetUser.role === 'admin' && newRole !== 'admin') {
      const activeAdmins = users.filter(u => u.role === 'admin');
      if (activeAdmins.length <= 1) {
        return false;
      }
      adminEmails = adminEmails.filter(e => e !== targetEmail);
      saveAuthorizedAdminEmails(adminEmails);
    }

    // If assigning admin role, add email to authorized admin list
    if (newRole === 'admin') {
      if (!adminEmails.includes(targetEmail)) {
        adminEmails.push(targetEmail);
        saveAuthorizedAdminEmails(adminEmails);
      }
    }

    users[idx].role = newRole;
    saveUsers(users);

    if (current && current.id === userId) {
      current.role = newRole;
      this.setCurrentUser(current);
    }

    window.dispatchEvent(new Event('auth-state-change'));
    window.dispatchEvent(new Event('pata-data-change'));
    return true;
  },

  login(email: string, password: string): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Auto-restore root admin account if not found
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
        createdAt: '2025-12-01',
        registeredAt: '01 Dic 2025',
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

    const isUserAdmin = user.role === 'admin' || this.isAuthorizedAdminEmail(cleanEmail);

    // Validation for administrators (root or added)
    if (isUserAdmin) {
      const isRootMatch = adminCred && cleanPassword === adminCred.password;
      const isStoredMatch = user.passwordHash === password || user.passwordHash === cleanPassword;

      if (!isRootMatch && !isStoredMatch) {
        return {
          success: false,
          message: 'Contraseña de administrador incorrecta. Por favor verifica tus datos de acceso.'
        };
      }

      user.role = 'admin';
      saveUsers(users);

      const { passwordHash: _, ...publicUser } = user;
      publicUser.role = 'admin';
      this.setCurrentUser(publicUser);
      return {
        success: true,
        message: `¡Bienvenida Administradora / Administrador, ${publicUser.name}! Has iniciado sesión correctamente.`,
        user: publicUser
      };
    }

    if (user.passwordHash !== password && user.passwordHash !== cleanPassword) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Por favor verifica tus datos o usa la opción "¿Olvidaste tu contraseña?".'
      };
    }

    const { passwordHash: _, ...publicUser } = user;
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

    if (this.isAuthorizedAdminEmail(cleanEmail)) {
      return {
        success: false,
        message: 'Este correo electrónico está asignado a la administración. Por favor inicia sesión directamente.'
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

  createUserByAdmin(data: { name: string; email: string; phone: string; role: UserRole; password?: string; location?: string }): AuthResponse {
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

    // If role is admin, register email in authorized admins
    if (data.role === 'admin') {
      const adminEmails = getAuthorizedAdminEmails();
      if (!adminEmails.includes(cleanEmail)) {
        adminEmails.push(cleanEmail);
        saveAuthorizedAdminEmails(adminEmails);
      }
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      phone: sanitizedPhone,
      location: data.location?.trim() || 'Purificación, Tolima',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      passwordHash: data.password || '123456'
    };

    users.unshift(newUser);
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = newUser;
    return {
      success: true,
      message: data.role === 'admin'
        ? `¡Nueva Administradora ${newUser.name} registrada exitosamente con acceso total al panel!`
        : `Usuario ${newUser.name} registrado con éxito con rol de ${newUser.role.toUpperCase()}.`,
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

    // Role safety: role cannot be escalated to admin without proper authority
    if (updates.role && updates.role !== users[userIndex].role) {
      const userEmail = users[userIndex].email.toLowerCase();
      if (updates.role === 'admin' && !this.isAuthorizedAdminEmail(userEmail)) {
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

    if (this.isAuthorizedAdminEmail(cleanEmail)) {
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

    if (this.isAuthorizedAdminEmail(cleanEmail)) {
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
    if (this.isAuthorizedAdminEmail(cleanEmail)) {
      users[userIndex].role = 'admin';
    }
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = users[userIndex];
    if (this.isAuthorizedAdminEmail(cleanEmail)) {
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

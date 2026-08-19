import { User } from '../types';

const AUTH_USER_KEY = 'pata_amiga_current_user';
const USERS_DB_KEY = 'pata_amiga_registered_users';
const RECOVERY_CODES_KEY = 'pata_amiga_recovery_codes';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface StoredUser extends User {
  passwordHash: string;
}

// Initial default user accounts for quick testing & realistic interaction
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user-demo-1',
    name: 'Danna Gascá',
    email: 'gascadanna414@gmail.com',
    role: 'ciudadano',
    phone: '+57 312 890 4521',
    location: 'Purificación, Tolima',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-10',
    passwordHash: '123456'
  },
  {
    id: 'user-demo-2',
    name: 'Dra. Sofía Ruiz',
    email: 'sofia.rescate@pataamiga.org',
    role: 'rescatista',
    phone: '+57 314 772 1093',
    location: 'Barrio El Ospina Pérez, Purificación',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-01-01',
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
    return JSON.parse(raw);
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
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    window.dispatchEvent(new Event('auth-state-change'));
  },

  login(email: string, password: string): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico.'
      };
    }

    if (user.passwordHash !== password) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Por favor verifica tus datos o usa la opción "Recuperar contraseña".'
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

  register(data: { name: string; email: string; password: string; phone?: string; role?: 'ciudadano' | 'voluntario' | 'rescatista' }): AuthResponse {
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.'
      };
    }

    if (data.password.length < 5) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 5 caracteres.'
      };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role || 'ciudadano',
      phone: data.phone || '',
      location: 'Purificación, Tolima',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: data.password
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

  requestPasswordReset(email: string): { success: boolean; message: string; simulatedCode?: string } {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
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

    if (newPassword.length < 5) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener mínimo 5 caracteres.'
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

    users[userIndex].passwordHash = newPassword;
    saveUsers(users);

    const { passwordHash: _, ...publicUser } = users[userIndex];
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

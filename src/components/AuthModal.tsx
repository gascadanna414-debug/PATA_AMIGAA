import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import { AuthController } from '../controllers/authController';
import { parsePhoneWithCountry } from '../utils/phoneUtils';
import { PhoneInput } from './PhoneInput';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset-code'>(initialMode);
  
  // Synchronize mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'ciudadano' | 'voluntario' | 'rescatista'>('ciudadano');

  // Forgot / Reset password state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [simulatedCodeSent, setSimulatedCodeSent] = useState<string | null>(null);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.login(loginEmail.trim(), loginPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg('Por favor completa todos los campos obligatorios: Nombre, correo, contraseña y confirmación.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor confirma que ambas contraseñas sean idénticas.');
      return;
    }

    if (regPhone) {
      const phoneValidation = parsePhoneWithCountry(regPhone);
      if (!phoneValidation.isValid) {
        setErrorMsg(phoneValidation.message);
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        role: regRole
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 700);
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoveryEmail.trim()) {
      setErrorMsg('Ingresa el correo electrónico asociado a tu cuenta.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.requestPasswordReset(recoveryEmail.trim());
      setLoading(false);
      if (res.success) {
        setSimulatedCodeSent(res.simulatedCode || '123456');
        setSuccessMsg(res.message);
        setMode('reset-code');
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoveryCode.trim() || !newPassword) {
      setErrorMsg('Ingresa el código de 6 dígitos y tu nueva contraseña.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.resetPasswordWithCode(recoveryEmail.trim(), recoveryCode.trim(), newPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div className="bg-[#2C1E14] px-5 sm:px-6 py-4 sm:py-5 text-[#FAF6F0] flex items-center justify-between border-b border-[#3D2C1F]">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Fraunces',serif] text-white">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta (Registro)'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
                {mode === 'reset-code' && 'Restablecer Contraseña'}
              </h2>
              <p className="text-[11px] text-[#D8C7BA]">
                Purificación, Tolima • Comunidad Animalista
              </p>
            </div>
          </div>
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="text-[#D8C7BA] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Iniciar Sesión vs Registrarse */}
        <div className="bg-[#FAF6F0] px-5 sm:px-6 pt-3 pb-2 border-b border-[#E8DFD3]">
          <div className="flex bg-[#EFE7DC] p-1 rounded-2xl border border-[#DFD4C4]">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#9E6B38] text-white shadow-xs'
                  : 'text-[#6E574B] hover:text-[#2C1E14]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#9E6B38] text-white shadow-xs'
                  : 'text-[#6E574B] hover:text-[#2C1E14]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#2C1E14] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9E6B38] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#2C1E14]">
                    Contraseña
                  </label>
                  <button
                    id="goto-forgot-btn"
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(loginEmail);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('forgot');
                    }}
                    className="text-xs text-[#9E6B38] hover:text-[#86582A] font-semibold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                {/* Password field with Eye Toggle */}
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                  />
                  <button
                    id="toggle-login-password-btn"
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Ingresar a Pata Amiga</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-[#F5EDE2]">
                <p className="text-xs text-[#6E574B]">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    id="goto-register-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('register');
                    }}
                    className="text-[#9E6B38] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Registrarse gratis
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Ej. María Fernanda Morales"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <PhoneInput
                  id="register-phone-input"
                  label="Teléfono / WhatsApp"
                  value={regPhone}
                  onChange={setRegPhone}
                  required={false}
                  helperText="Selecciona tu país e ingresa tu número para coordinar rescates o adopciones"
                />

                <div>
                  <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    ¿Cómo deseas unirte?
                  </label>
                  <select
                    id="register-role-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  >
                    <option value="ciudadano">Ciudadano / Adoptante</option>
                    <option value="voluntario">Voluntario de Brigadas</option>
                    <option value="rescatista">Rescatista de Animales</option>
                  </select>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Contraseña * <span className="text-[10px] text-[#8A7568] font-normal">(mínimo 4 caracteres)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="register-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Crea tu propia contraseña"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                  <button
                    id="toggle-reg-password-btn"
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                    title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verify Password field */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Verificar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="register-confirm-password-input"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Repite la contraseña"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 bg-[#FAF6F0] border rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] ${
                      regConfirmPassword && regConfirmPassword !== regPassword
                        ? 'border-red-300'
                        : 'border-[#E8DFD3]'
                    }`}
                  />
                  <button
                    id="toggle-reg-confirm-password-btn"
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                    title={showRegConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {regConfirmPassword && regConfirmPassword !== regPassword && (
                  <p className="text-[10px] text-red-600 mt-1">Las contraseñas no coinciden.</p>
                )}
              </div>

              <div className="text-[11px] text-[#6E574B] flex items-start gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#9E6B38] shrink-0 mt-0.5" />
                <span>Tus datos estarán protegidos y se usarán exclusivamente para coordinar adopciones y rescates en Purificación, Tolima.</span>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? 'Registrando cuenta...' : 'Crear mi cuenta en Pata Amiga'}
              </button>

              <div className="pt-2 text-center border-t border-[#F5EDE2]">
                <p className="text-xs text-[#6E574B]">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    id="goto-login-from-reg"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('login');
                    }}
                    className="text-[#9E6B38] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div className="text-xs text-[#5C4538] leading-relaxed bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8DFD3]">
                Ingresa el correo electrónico con el que te registraste. Te enviaremos un código de seguridad para que puedas restablecer tu contraseña inmediatamente.
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? 'Generando código...' : 'Enviar Código de Recuperación'}
              </button>

              <div className="pt-2 text-center border-t border-[#F5EDE2]">
                <button
                  id="back-to-login-btn"
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="text-xs text-[#6E574B] hover:text-[#9E6B38] font-medium cursor-pointer"
                >
                  ← Volver a Inicio de Sesión
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD WITH CODE */}
          {mode === 'reset-code' && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              {simulatedCodeSent && (
                <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] text-[#2C1E14] text-xs">
                  <p className="font-semibold flex items-center gap-1 text-[#2C1E14]">
                    <KeyRound className="w-3.5 h-3.5 text-[#9E6B38]" />
                    Código de verificación generado:
                  </p>
                  <p className="text-xl font-black text-[#9E6B38] tracking-widest my-1 font-mono">
                    {simulatedCodeSent}
                  </p>
                  <p className="text-[11px] text-[#6E574B]">
                    (Se ha enviado una copia a {recoveryEmail}. Puedes usar este código directamente).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Código de 6 dígitos
                </label>
                <input
                  id="reset-code-input"
                  type="text"
                  required
                  placeholder="Ej. 123456"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#9E6B38] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Nueva Contraseña (mínimo 4 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="reset-new-password-input"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                  <button
                    id="toggle-reset-password-btn"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                    title={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                id="reset-confirm-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? 'Guardando cambios...' : 'Restablecer y Entrar'}
              </button>

              <div className="pt-2 text-center border-t border-[#F5EDE2]">
                <button
                  id="back-to-forgot-btn"
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#6E574B] hover:text-[#9E6B38] font-medium cursor-pointer"
                >
                  ← Cambiar correo electrónico
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

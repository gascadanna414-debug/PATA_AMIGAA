import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthController } from '../controllers/authController';
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
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
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

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.login(loginEmail, loginPassword);
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

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
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

    if (!recoveryEmail) {
      setErrorMsg('Ingresa el correo electrónico asociado a tu cuenta.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.requestPasswordReset(recoveryEmail);
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

    if (!recoveryCode || !newPassword) {
      setErrorMsg('Ingresa el código de 6 dígitos y tu nueva contraseña.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthController.resetPasswordWithCode(recoveryEmail, recoveryCode, newPassword);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit',sans-serif] text-white">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta en Pata Amiga'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
                {mode === 'reset-code' && 'Restablecer Contraseña'}
              </h2>
              <p className="text-[11px] text-[#BAE6FD]">
                Purificación, Tolima • Comunidad Animalista
              </p>
            </div>
          </div>
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0F172A] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
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
                    className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                {/* Password field with Eye Toggle */}
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition"
                  />
                  <button
                    id="toggle-login-password-btn"
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-[#0284C7] focus:outline-none cursor-pointer"
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

              {/* Quick demo credential helper */}
              <div className="p-2.5 bg-[#F5EFEB] rounded-xl border border-[#E5DDD0] text-[11px] text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A]">💡 Cuenta de prueba:</span>
                  <span className="ml-1 text-slate-600">Danna (Purificación)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('gascadanna414@gmail.com');
                    setLoginPassword('123456');
                  }}
                  className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-[10px] font-bold hover:bg-[#0369A1] cursor-pointer"
                >
                  Autocompletar
                </button>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
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

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    id="goto-register-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('register');
                    }}
                    className="text-[#0284C7] font-bold hover:underline cursor-pointer"
                  >
                    Crear cuenta gratis
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Ej. María Fernanda Morales"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                    <input
                      id="register-phone-input"
                      type="tel"
                      placeholder="312 890 4521"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ¿Cómo deseas unirte?
                  </label>
                  <select
                    id="register-role-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  >
                    <option value="ciudadano">Ciudadano / Adoptante</option>
                    <option value="voluntario">Voluntario de Brigadas</option>
                    <option value="rescatista">Rescatista de Animales</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crear Contraseña * (mínimo 5 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="register-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={5}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <button
                    id="toggle-reg-password-btn"
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-[#0284C7] focus:outline-none cursor-pointer"
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

              <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <span>Tus datos estarán seguros y se usarán para coordinar adopciones y rescates en Purificación, Tolima.</span>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrarme en Pata Amiga'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    id="goto-login-from-reg"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('login');
                    }}
                    className="text-[#0284C7] font-bold hover:underline cursor-pointer"
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
              <div className="text-xs text-slate-600 leading-relaxed bg-[#E0F2FE]/50 p-3 rounded-xl border border-[#BAE6FD]">
                Ingresa el correo electrónico con el que te registraste. Te enviaremos un código de seguridad para que puedas restablecer tu contraseña inmediatamente.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Generando código...' : 'Enviar Código de Recuperación'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  id="back-to-login-btn"
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="text-xs text-slate-600 hover:text-[#0284C7] font-medium cursor-pointer"
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
                <div className="p-3 bg-[#E0F2FE] rounded-xl border border-[#BAE6FD] text-[#0F172A] text-xs">
                  <p className="font-bold flex items-center gap-1 text-[#0F172A]">
                    <KeyRound className="w-3.5 h-3.5 text-[#0284C7]" />
                    Código de verificación generado:
                  </p>
                  <p className="text-xl font-black text-[#0284C7] tracking-widest my-1 font-mono">
                    {simulatedCodeSent}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    (Se ha enviado una copia a {recoveryEmail}. Puedes usar este código directamente).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de 6 dígitos
                </label>
                <input
                  id="reset-code-input"
                  type="text"
                  required
                  placeholder="Ej. 123456"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#0284C7] absolute left-3 top-3" />
                  <input
                    id="reset-new-password-input"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={5}
                    placeholder="Mínimo 5 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <button
                    id="toggle-reset-password-btn"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-[#0284C7] focus:outline-none cursor-pointer"
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
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Guardando cambios...' : 'Restablecer y Entrar'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  id="back-to-forgot-btn"
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-slate-600 hover:text-[#0284C7] font-medium"
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

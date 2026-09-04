import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Camera, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Upload, 
  Sparkles 
} from 'lucide-react';
import { User } from '../types';
import { AuthController } from '../controllers/authController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProfileUpdated?: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=PataAmigaPuri1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=PataAmigaPuri2'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarTab, setAvatarTab] = useState<'presets' | 'url' | 'upload'>('presets');
  
  // Password change fields
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      // Format phone for display
      const rawDigits = (currentUser.phone || '').replace(/\D/g, '');
      const last10 = rawDigits.slice(-10);
      setPhone(last10.length === 10 ? `${last10.slice(0, 3)} ${last10.slice(3, 6)} ${last10.slice(6)}` : currentUser.phone || '');
      setLocation(currentUser.location || 'Barrio Camilo Torres, Purificación');
      setAvatar(currentUser.avatar || '');
      setNewPassword('');
      setConfirmPassword('');
      setChangePassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) {
      setPhone(digits);
    } else if (digits.length <= 6) {
      setPhone(`${digits.slice(0, 3)} ${digits.slice(3)}`);
    } else {
      setPhone(`${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG o WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    if (cleanName.length < 3) {
      setErrorMsg('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setErrorMsg('Ingresa un número de celular colombiano válido de 10 dígitos (ej: 312 890 4521).');
      return;
    }

    if (changePassword) {
      if (newPassword.trim().length < 6) {
        setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    setLoading(true);

    try {
      const updates: Partial<User> & { password?: string } = {
        name: cleanName,
        phone: digits,
        location: location.trim(),
        avatar: avatar.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`
      };

      if (changePassword && newPassword.trim()) {
        updates.password = newPassword.trim();
      }

      const res = AuthController.updateUserProfile(currentUser.id, updates);

      if (res.success && res.user) {
        setSuccessMsg('¡Tu perfil ha sido actualizado con éxito!');
        if (onProfileUpdated) {
          onProfileUpdated(res.user);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'No se pudo actualizar el perfil.');
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2C1E14] px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between border-b border-[#3D2C1F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9E6B38] flex items-center justify-center text-white shadow-inner">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-['Fraunces',serif]">
                Editar Mi Perfil
              </h3>
              <p className="text-xs text-[#D8C7BA]">
                Actualiza tus datos de contacto y foto en Purificación
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="text-[#D8C7BA] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3]">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#9E6B38] text-white flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md">
                {avatar ? (
                  <img
                    src={resolveImageUrl(avatar, 'avatar')}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, 'avatar')}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  name.charAt(0).toUpperCase() || 'P'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C1E14] block">
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAvatarTab('presets')}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                      avatarTab === 'presets' ? 'bg-[#9E6B38] text-white' : 'bg-white text-[#6E574B] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    Galería
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('upload')}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                      avatarTab === 'upload' ? 'bg-[#9E6B38] text-white' : 'bg-white text-[#6E574B] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('url')}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                      avatarTab === 'url' ? 'bg-[#9E6B38] text-white' : 'bg-white text-[#6E574B] hover:bg-[#EAE2D5]'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {avatarTab === 'presets' && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        avatar === preset ? 'border-[#9E6B38] scale-105 shadow-xs' : 'border-white hover:border-[#D5C8B8]'
                      }`}
                    >
                      <img 
                        src={resolveImageUrl(preset, 'avatar')} 
                        alt="Avatar preset" 
                        className="w-full h-full object-cover" 
                        onError={(e) => handleImageError(e, 'avatar')}
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'pata') + Date.now()}`)}
                    className="px-2 py-1 bg-white border border-[#E8DFD3] rounded-lg text-[10px] font-medium text-[#5C4538] hover:bg-[#FAF6F0] shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Generar avatar aleatorio"
                  >
                    <Sparkles className="w-3 h-3 text-[#9E6B38]" />
                    <span>Aleatorio</span>
                  </button>
                </div>
              )}

              {avatarTab === 'upload' && (
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-dashed border-[#D5C8B8] rounded-xl text-xs text-[#6E574B] hover:bg-[#FAF6F0] cursor-pointer transition">
                  <Upload className="w-4 h-4 text-[#9E6B38]" />
                  <span>Elegir imagen desde mi dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {avatarTab === 'url' && (
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className="w-full px-3 py-1.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="profile-name-input" className="block text-xs font-semibold text-[#2C1E14] mb-1">
              Nombre y Apellidos *
            </label>
            <div className="relative">
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. María Fernanda Morales"
                className="w-full pl-3.5 pr-4 py-2.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              />
            </div>
          </div>

          {/* Email (Read-only / Security) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#2C1E14]">
                Correo Electrónico
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Cuenta Verificada ({currentUser.role})</span>
              </span>
            </div>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 py-2.5 bg-[#F5EDE2] border border-[#E8DFD3] rounded-xl text-xs text-[#6E574B] cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-[#8A7568] mt-1">
              El correo está vinculado a tu cuenta para notificaciones de brigadas y adopción.
            </p>
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="profile-phone-input" className="block text-xs font-semibold text-[#2C1E14] mb-1">
                Teléfono Celular *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#8A7568] font-bold">
                  +57
                </span>
                <input
                  id="profile-phone-input"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="312 890 4521"
                  maxLength={12}
                  className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] font-mono"
                />
              </div>
              <span className="text-[10px] text-[#8A7568] mt-0.5 block">
                10 dígitos para contacto en Purificación
              </span>
            </div>

            <div>
              <label htmlFor="profile-location-select" className="block text-xs font-semibold text-[#2C1E14] mb-1">
                Barrio / Sector en Purificación *
              </label>
              <select
                id="profile-location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              >
                {PURIFICACION_NEIGHBORHOODS.map((nb, i) => (
                  <option key={i} value={`${nb}, Purificación`}>
                    {nb}
                  </option>
                ))}
                <option value="Zona Rural / Vereda de Purificación">
                  Zona Rural / Vereda de Purificación
                </option>
                <option value="Centro, Purificación">
                  Barrio Centro, Purificación
                </option>
              </select>
            </div>
          </div>

          {/* Change Password Toggle */}
          <div className="pt-2 border-t border-[#EAE2D5]">
            <button
              type="button"
              onClick={() => setChangePassword(!changePassword)}
              className="text-xs font-semibold text-[#9E6B38] hover:text-[#86582A] flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{changePassword ? 'Cancelar cambio de contraseña' : '¿Deseas cambiar tu contraseña?'}</span>
            </button>

            {changePassword && (
              <div className="mt-3 p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] space-y-3 animate-in slide-in-from-top-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="profile-new-password" className="block text-xs font-semibold text-[#2C1E14]">
                      Nueva Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-[11px] text-[#8A7568] hover:text-[#2C1E14] flex items-center gap-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPass ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                  </div>
                  <input
                    id="profile-new-password"
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>

                <div>
                  <label htmlFor="profile-confirm-password" className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="profile-confirm-password"
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-3.5 py-2 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE2D5]">
            <button
              id="cancel-profile-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF6F0] hover:bg-[#EAE2D5] border border-[#E8DFD3] text-[#5C4538] rounded-full text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="save-profile-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

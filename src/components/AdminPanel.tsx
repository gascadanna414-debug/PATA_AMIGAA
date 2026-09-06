import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Heart, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  X, 
  Search, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Camera, 
  UserCheck, 
  ShieldAlert,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Filter,
  Check,
  EyeOff,
  Bell,
  CheckCheck,
  Inbox,
  CheckCircle,
  BellOff,
  Send,
  MailCheck,
  RefreshCw,
  AlertTriangle,
  Key,
  HelpCircle
} from 'lucide-react';
import { 
  User, 
  UserRole,
  HealthEvent, 
  AdoptionPet, 
  SuccessStory, 
  AnimalReport, 
  EventRegistration,
  AdoptionApplication,
  ContactMessage,
  AppNotification
} from '../types';
import { AuthController, AUTHORIZED_ADMIN_EMAILS, AUTHORIZED_ADMIN_CREDENTIALS } from '../controllers/authController';
import { StoreController } from '../controllers/storeController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { sanitizePhone10, isValidPhone10, formatPhone10, parsePhoneWithCountry } from '../utils/phoneUtils';
import { PhoneInput } from './PhoneInput';

interface AdminPanelProps {
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onOpenAuth,
  onNavigateToTab
}) => {
  const isAdmin = AuthController.isAdmin(currentUser);

  const [activeAdminTab, setActiveAdminTab] = useState<'notificaciones' | 'reportes' | 'solicitudes' | 'mensajes' | 'brigadas' | 'adopciones' | 'usuarios' | 'historias'>('notificaciones');
  
  // Data states
  const [usersList, setUsersList] = useState<User[]>(() => AuthController.getAllUsers());
  const [reportsList, setReportsList] = useState<AnimalReport[]>(() => StoreController.getReports());
  const [eventsList, setEventsList] = useState<HealthEvent[]>(() => StoreController.getEvents());
  const [petsList, setPetsList] = useState<AdoptionPet[]>(() => StoreController.getAdoptionPets());
  const [storiesList, setStoriesList] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [appsList, setAppsList] = useState<AdoptionApplication[]>(() => StoreController.getAdoptionApplications());
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>(() => StoreController.getEventRegistrations());
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => StoreController.getContactMessages());
  const [adminNotifications, setAdminNotifications] = useState<AppNotification[]>(() => StoreController.getAdminNotifications());

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [speciesFilter, setSpeciesFilter] = useState<string>('todos');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('todos');
  const [messageFilter, setMessageFilter] = useState<'todos' | 'no_leidos' | 'leidos'>('todos');
  const [adminNotifFilter, setAdminNotifFilter] = useState<'todos' | 'reportes' | 'adopciones' | 'mensajes' | 'brigadas'>('todos');
  const [adminNotifOnlyUnread, setAdminNotifOnlyUnread] = useState<boolean>(false);

  // Modals & Form States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('voluntario');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userModalError, setUserModalError] = useState<string | null>(null);

  const [editingPet, setEditingPet] = useState<Partial<AdoptionPet> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<HealthEvent> | null>(null);
  const [editingStory, setEditingStory] = useState<Partial<SuccessStory> | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<AnimalReport | null>(null);
  const [viewingRegistrationsEventId, setViewingRegistrationsEventId] = useState<string | null>(null);

  // Login State for non-admins viewing the tab (privacy masked email support)
  const [quickLoginEmail, setQuickLoginEmail] = useState('');
  const [quickLoginPass, setQuickLoginPass] = useState('');
  const [showQuickLoginPass, setShowQuickLoginPass] = useState(false);
  const [hideAdminEmail, setHideAdminEmail] = useState(true);
  const [quickLoginError, setQuickLoginError] = useState<string | null>(null);

  // Success message banner
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // In-app confirmation dialog for safe deletion (replaces blocked window.confirm in iframes)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'contact' | 'event' | 'pet' | 'user' | 'report' | 'story' | 'attendee' | 'application';
    id: string;
    name: string;
    detail?: string;
  } | null>(null);

  // Adoption application review modal to send notifications and custom messages
  const [reviewAppModal, setReviewAppModal] = useState<{
    app: AdoptionApplication;
    action: 'aprobada' | 'rechazada';
  } | null>(null);
  const [reviewCustomNote, setReviewCustomNote] = useState<string>('');

  // Email Server Diagnostics & Status
  const [emailServerStatus, setEmailServerStatus] = useState<{
    configured: boolean;
    provider: string;
    account: string | null;
    recipients: string[];
    instructions: string;
  } | null>(null);
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const fetchEmailStatus = () => {
    StoreController.checkEmailServerStatus().then(status => {
      setEmailServerStatus(status);
    });
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const refreshAllData = () => {
    setUsersList(AuthController.getAllUsers());
    setReportsList(StoreController.getReports());
    setEventsList(StoreController.getEvents());
    setPetsList(StoreController.getAdoptionPets());
    setStoriesList(StoreController.getSuccessStories());
    setAppsList(StoreController.getAdoptionApplications());
    setRegistrationsList(StoreController.getEventRegistrations());
    setContactMessages(StoreController.getContactMessages());
    setAdminNotifications(StoreController.getAdminNotifications());
  };

  useEffect(() => {
    const handleDataChange = () => {
      refreshAllData();
    };
    window.addEventListener('pata-data-change', handleDataChange);
    window.addEventListener('pata-notifications-change', handleDataChange);
    window.addEventListener('auth-state-change', handleDataChange);
    fetchEmailStatus();
    return () => {
      window.removeEventListener('pata-data-change', handleDataChange);
      window.removeEventListener('pata-notifications-change', handleDataChange);
      window.removeEventListener('auth-state-change', handleDataChange);
    };
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'notificaciones') {
      fetchEmailStatus();
    }
  }, [activeAdminTab]);

  const handleTestRealEmailDispatch = async () => {
    setIsTestingEmail(true);
    try {
      const res = await StoreController.sendServerTestEmail();
      fetchEmailStatus();
      setAdminNotifications(StoreController.getAdminNotifications());
      if (res.delivered) {
        showNotification('✅ ¡Correo de prueba enviado con éxito a las 4 administradoras! Revisa tu bandeja de Gmail.');
      } else if (res.configured === false) {
        setShowEmailConfigModal(true);
        showNotification('⚠️ El servidor de correo requiere credenciales (GMAIL_USER / GMAIL_APP_PASSWORD) para despachar a tu bandeja de Gmail.');
      } else {
        showNotification(`Aviso: ${res.error || res.message || 'No se pudo completar el despacho'}`);
      }
    } catch (e: any) {
      showNotification('Error contactando con el servicio de correo.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleOpenGmailWeb = (notif: AppNotification) => {
    const url = StoreController.getGmailComposeUrl(notif);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMarkAllAdminNotifsRead = () => {
    StoreController.markAllAdminNotificationsRead();
    setAdminNotifications(StoreController.getAdminNotifications());
    showNotification('Todas las notificaciones administrativas han sido marcadas como leídas.');
  };

  const handleToggleAdminNotifRead = (notifId: string, currentRead: boolean) => {
    if (currentRead) {
      StoreController.markAdminNotificationUnread(notifId);
    } else {
      StoreController.markAdminNotificationRead(notifId);
    }
    setAdminNotifications(StoreController.getAdminNotifications());
  };

  const handleDeleteAdminNotif = (notifId: string) => {
    StoreController.deleteAdminNotification(notifId);
    setAdminNotifications(StoreController.getAdminNotifications());
    showNotification('Notificación eliminada de la bandeja.');
  };

  const handleNavigateFromNotif = (notif: AppNotification) => {
    // Marcar como leída en buzón administrativo
    StoreController.markAdminNotificationRead(notif.id);
    setAdminNotifications(StoreController.getAdminNotifications());

    if (notif.type === 'reporte') {
      setActiveAdminTab('reportes');
      setReportStatusFilter('todos');
      setSearchQuery('');
      if (notif.metadata?.reportId) {
        const found = reportsList.find(r => r.id === notif.metadata?.reportId);
        if (found) {
          setSelectedReportDetail(found);
        }
      }
    } else if (notif.type === 'adopcion') {
      setActiveAdminTab('solicitudes');
      setSearchQuery('');
    } else if (notif.type === 'sistema' && (notif.linkTab === 'admin' || notif.metadata?.contactId)) {
      setActiveAdminTab('contacto');
      setSearchQuery('');
    }
  };

  const handleResendAdminEmail = (notifId: string) => {
    const res = StoreController.resendAdminNotificationEmail(notifId);
    setAdminNotifications(StoreController.getAdminNotifications());
    if (res.success) {
      showNotification(`Alerta reenviada exitosamente a los correos de ${res.recipients.length} administradores.`);
    } else {
      showNotification('No se pudo reenviar la alerta a los correos.');
    }
  };

  const handleTestAdminEmailDispatch = () => {
    const res = StoreController.testAdminEmailDispatch();
    setAdminNotifications(StoreController.getAdminNotifications());
    showNotification(`Despacho de prueba ejecutado a ${res.recipients.length} correos administrativos.`);
  };

  // Preset photo galleries for easy animal registration
  const PRESET_PET_PHOTOS = [
    { label: 'Mateo (Perro Criollo)', url: '/images/mateo_rescue_story_1788226480262.jpg' },
    { label: 'Hades (Perro Fuerte)', url: '/images/hades_rescue_1788225379594.jpg' },
    { label: 'Luna (Gatita)', url: '/images/luna_cat_1788225396552.jpg' },
    { label: 'Pelusa (Gato Blanco)', url: '/images/pelusa_cat_1788225413009.jpg' },
    { label: 'Rocky (Perro Guardián)', url: '/images/rocky_hero_dog_1788225363402.jpg' }
  ];

  // --- ACTIONS: USER MANAGEMENT ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPhone.trim() || !newUserPassword.trim()) {
      setUserModalError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (newUserPassword.trim().length < 5 || newUserPassword.trim().length > 13) {
      setUserModalError('La contraseña debe tener entre 5 y 13 caracteres.');
      return;
    }

    const phoneValidation = parsePhoneWithCountry(newUserPhone);
    if (!phoneValidation.isValid) {
      setUserModalError(phoneValidation.message);
      return;
    }

    const res = AuthController.createUserByAdmin({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      role: newUserRole,
      password: newUserPassword.trim()
    });

    if (res.success) {
      setIsAddingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      refreshAllData();
      showNotification(res.message);
    } else {
      setUserModalError(res.message);
    }
  };

  const handleMarkMessageRead = (msgId: string) => {
    StoreController.markContactMessageRead(msgId);
    refreshAllData();
    showNotification('Mensaje marcado como leído.');
  };

  const handleDeleteContactMessage = (msgId: string, senderName: string, subject?: string) => {
    setDeleteTarget({
      type: 'contact',
      id: msgId,
      name: `Mensaje de ${senderName}`,
      detail: subject ? `Asunto: "${subject}"` : undefined
    });
  };

  const handleToggleAdminRole = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    if (!AUTHORIZED_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      showNotification('Por seguridad, solo las Administradoras autorizadas pueden gestionar el Panel.');
      return;
    }
    showNotification('No se puede revocar el rol a una Administradora oficial del sistema.');
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const targetEmail = targetUser.email.toLowerCase();

    if (newRole === 'admin' && !AUTHORIZED_ADMIN_EMAILS.includes(targetEmail)) {
      showNotification('Por seguridad, solo las Administradoras autorizadas pueden tener este rol.');
      return;
    }
    if (AUTHORIZED_ADMIN_EMAILS.includes(targetEmail) && newRole !== 'admin') {
      showNotification('No se puede alterar el rol de una Administradora oficial del sistema.');
      return;
    }
    AuthController.updateUserRole(userId, newRole);
    refreshAllData();
    showNotification(`Rol actualizado a ${newRole.toUpperCase()}`);
  };

  const handleDeleteUser = (userId: string, userName: string, email?: string) => {
    if (email && AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase())) {
      showNotification('No se puede eliminar a una Administradora oficial del sistema.');
      return;
    }
    setDeleteTarget({
      type: 'user',
      id: userId,
      name: userName,
      detail: email ? `Correo: ${email}` : undefined
    });
  };

  // --- ACTIONS: REPORT MANAGEMENT ---
  const handleUpdateReportStatus = (reportId: string, status: AnimalReport['status'], statusNote?: string) => {
    StoreController.updateReportStatus(reportId, status, statusNote);
    refreshAllData();
    if (selectedReportDetail && selectedReportDetail.id === reportId) {
      setSelectedReportDetail(prev => prev ? { ...prev, status, statusNote: statusNote || prev.statusNote } : null);
    }
    showNotification(`Estado del reporte actualizado a ${status.toUpperCase()}`);
  };

  const handleDeleteReport = (reportId: string, neighborhood?: string, animalType?: string) => {
    setDeleteTarget({
      type: 'report',
      id: reportId,
      name: `Reporte de ${animalType || 'animal'}`,
      detail: neighborhood ? `Ubicación: ${neighborhood}, Purificación` : undefined
    });
  };

  // --- ACTIONS: EVENTS / BRIGADAS (Limit 25) ---
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent.date || !editingEvent.time || !editingEvent.locationName) {
      showNotification('Por favor completa todos los campos requeridos de la brigada.');
      return;
    }

    if (editingEvent.contactPhone && !isValidPhone10(editingEvent.contactPhone)) {
      showNotification('El teléfono de contacto de la brigada debe tener exactamente 10 caracteres (ej: 3128904521).');
      return;
    }

    StoreController.saveHealthEvent({
      ...editingEvent,
      title: editingEvent.title!,
      date: editingEvent.date!,
      time: editingEvent.time!,
      locationName: editingEvent.locationName!,
      address: editingEvent.address || 'Purificación, Tolima',
      contactPhone: editingEvent.contactPhone || '3128904521',
      totalSpots: 25
    });

    setEditingEvent(null);
    refreshAllData();
    showNotification('Brigada de salud guardada exitosamente con límite de 25 cupos.');
  };

  const handleDeleteEvent = (eventId: string, title?: string) => {
    setDeleteTarget({
      type: 'event',
      id: eventId,
      name: title || 'Brigada de salud',
      detail: 'Se removerá la jornada del calendario y del panel.'
    });
  };

  const handleDeleteAttendee = (regId: string, attendeeName: string, petName?: string) => {
    setDeleteTarget({
      type: 'attendee',
      id: regId,
      name: `Inscripción de ${attendeeName}`,
      detail: petName ? `Mascota: ${petName} — Se liberará 1 cupo.` : 'Se liberará 1 cupo en la brigada.'
    });
  };

  // --- ACTIONS: ADOPTIONS (PETS) ---
  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet?.name || !editingPet.species || !editingPet.breed || !editingPet.story) {
      showNotification('Por favor completa los campos principales del animal en adopción.');
      return;
    }

    if (editingPet.rescuerContact && !isValidPhone10(editingPet.rescuerContact)) {
      showNotification('El teléfono de contacto del rescatista debe tener exactamente 10 dígitos (ej: 3128904521).');
      return;
    }

    StoreController.saveAdoptionPet({
      ...editingPet,
      name: editingPet.name!,
      species: editingPet.species as any,
      breed: editingPet.breed!,
      story: editingPet.story!,
      photos: editingPet.photos && editingPet.photos.length > 0 ? editingPet.photos : ['/images/mateo_rescue_story_1788226480262.jpg'],
      rescuerContact: editingPet.rescuerContact || '3128904521',
      rescuerLocation: editingPet.rescuerLocation || 'Purificación, Tolima'
    });

    setEditingPet(null);
    refreshAllData();
    showNotification('Ficha de adopción guardada con éxito.');
  };

  const handleDeletePet = (petId: string, petName?: string, details?: string) => {
    setDeleteTarget({
      type: 'pet',
      id: petId,
      name: petName || 'Animal en adopción',
      detail: details || 'Se removerá de la lista de adopciones activas.'
    });
  };

  const handleQuickTogglePetStatus = (pet: AdoptionPet) => {
    const nextStatus: AdoptionPet['status'] = pet.status === 'disponible' ? 'adoptado' : 'disponible';
    StoreController.updatePetStatus(pet.id, nextStatus);
    refreshAllData();
    showNotification(`Estado de ${pet.name} cambiado a ${nextStatus.toUpperCase()}`);
  };

  // --- ACTIONS: STORIES ---
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.petName || !editingStory.breed || !editingStory.rescueStory || !editingStory.adoptionStory) {
      showNotification('Por favor completa los campos de la historia de rescate.');
      return;
    }

    StoreController.saveSuccessStory({
      ...editingStory,
      petName: editingStory.petName!,
      breed: editingStory.breed!,
      rescueStory: editingStory.rescueStory!,
      adoptionStory: editingStory.adoptionStory!
    });

    setEditingStory(null);
    refreshAllData();
    showNotification('Historia de rescate guardada con éxito.');
  };

  const handleDeleteStory = (storyId: string, petName?: string) => {
    setDeleteTarget({
      type: 'story',
      id: storyId,
      name: petName ? `Historia de ${petName}` : 'Historia de rescate',
      detail: 'Se removerá la publicación de casos de éxito.'
    });
  };

  const handleDeleteApplication = (appId: string, applicantName: string, petName: string) => {
    setDeleteTarget({
      type: 'application',
      id: appId,
      name: `Postulación de ${applicantName}`,
      detail: `Mascota: ${petName} — Se eliminará esta solicitud de adopción.`
    });
  };

  // EXECUTE CONFIRMED DELETION
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.type) {
        case 'contact':
          StoreController.deleteContactMessage(deleteTarget.id);
          showNotification('Mensaje de contacto eliminado con éxito.');
          break;
        case 'event':
          StoreController.deleteHealthEvent(deleteTarget.id);
          showNotification('Brigada de salud eliminada del sistema.');
          break;
        case 'pet':
          StoreController.deleteAdoptionPet(deleteTarget.id);
          showNotification('Animal eliminado del catálogo de adopciones.');
          break;
        case 'user':
          AuthController.deleteUser(deleteTarget.id);
          showNotification('Usuario eliminado del sistema.');
          break;
        case 'report':
          StoreController.deleteReport(deleteTarget.id);
          setSelectedReportDetail(null);
          showNotification('Reporte ciudadano eliminado con éxito.');
          break;
        case 'story':
          StoreController.deleteSuccessStory(deleteTarget.id);
          showNotification('Historia de rescate eliminada con éxito.');
          break;
        case 'attendee':
          StoreController.deleteEventRegistration(deleteTarget.id);
          showNotification('Inscripción anulada y cupo liberado con éxito.');
          break;
        case 'application':
          StoreController.deleteAdoptionApplication(deleteTarget.id);
          showNotification('Postulación de adopción eliminada con éxito.');
          break;
      }
    } catch (err) {
      console.error('Error during deletion:', err);
      showNotification('Error al procesar la eliminación.');
    } finally {
      setDeleteTarget(null);
      refreshAllData();
    }
  };

  // Admin Login Action (without demo bypass)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoginError(null);

    const email = quickLoginEmail.trim().toLowerCase();
    const pass = quickLoginPass.trim();

    if (!email || !pass) {
      setQuickLoginError('Por favor ingresa tu correo y contraseña de administrador.');
      return;
    }

    const adminCred = AUTHORIZED_ADMIN_CREDENTIALS[email];
    if (!adminCred) {
      setQuickLoginError('Acceso denegado: El correo ingresado no cuenta con permisos de administración.');
      return;
    }

    if (pass !== adminCred.password) {
      setQuickLoginError('Contraseña de administrador incorrecta. Acceso no autorizado.');
      return;
    }

    const res = AuthController.login(email, pass);
    if (res.success) {
      const user = AuthController.getCurrentUser();
      if (user && AuthController.isAdmin(user)) {
        refreshAllData();
        showNotification(`¡Bienvenida al Panel Administrativo, ${user.name}!`);
      } else {
        setQuickLoginError('Esta cuenta no cuenta con permisos de Administrador.');
      }
    } else {
      setQuickLoginError(res.message);
    }
  };

  // If NOT ADMIN: Show secure Administrator Access Gate
  if (!currentUser || !isAdmin) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#9E6B38] mx-auto flex items-center justify-center border border-[#E8DFD3]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Panel de Administración
            </h2>
            <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
              Módulo de acceso restringido exclusivo para la administración autorizada de Pata Amiga Purificación. Permite gestionar usuarios registrados, animales en adopción, reportes ciudadanos, brigadas de salud y mensajes de contacto.
            </p>
          </div>

          {quickLoginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl text-left">
              {quickLoginError}
            </div>
          )}

          {/* Secure Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] space-y-3.5 text-left">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="admin-login-email" className="block text-xs font-semibold text-[#2C1E14]">
                  Correo Electrónico de Administrador
                </label>
                <button
                  type="button"
                  onClick={() => setHideAdminEmail(!hideAdminEmail)}
                  className="text-[11px] font-medium text-[#8A7568] hover:text-[#9E6B38] flex items-center gap-1 cursor-pointer transition"
                  title={hideAdminEmail ? 'Mostrar correo' : 'Ocultar correo para mayor privacidad'}
                >
                  {hideAdminEmail ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{hideAdminEmail ? 'Mostrar correo' : 'Ocultar correo'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-login-email"
                  type={hideAdminEmail ? 'password' : 'email'}
                  required
                  value={quickLoginEmail}
                  onChange={(e) => setQuickLoginEmail(e.target.value)}
                  placeholder={hideAdminEmail ? '••••••••••••••••••••' : 'correo@ejemplo.com'}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
                <button
                  type="button"
                  onClick={() => setHideAdminEmail(!hideAdminEmail)}
                  className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                  title={hideAdminEmail ? 'Mostrar correo' : 'Ocultar correo'}
                >
                  {hideAdminEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="admin-login-password" className="block text-xs font-semibold text-[#2C1E14]">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickLoginPass(!showQuickLoginPass)}
                  className="text-[11px] font-medium text-[#8A7568] hover:text-[#9E6B38] flex items-center gap-1 cursor-pointer transition"
                  title={showQuickLoginPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showQuickLoginPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showQuickLoginPass ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showQuickLoginPass ? 'text' : 'password'}
                  required
                  value={quickLoginPass}
                  onChange={(e) => setQuickLoginPass(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#D5C8B8] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
                <button
                  type="button"
                  onClick={() => setShowQuickLoginPass(!showQuickLoginPass)}
                  className="absolute right-3 top-2.5 p-0.5 text-[#8A7568] hover:text-[#9E6B38] focus:outline-none cursor-pointer"
                  title={showQuickLoginPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showQuickLoginPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-3 px-4 bg-[#2C1E14] hover:bg-[#3D2C1F] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#9E6B38]" />
              <span>Ingresar al Panel Administrativo</span>
            </button>
          </form>

          {currentUser && !isAdmin && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <p>Sesión activa actual: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
              <p>Tu cuenta actual no cuenta con permisos de Administrador(a). Inicia sesión con las credenciales autorizadas de administración.</p>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="text-xs text-[#9E6B38] hover:underline font-semibold"
            >
              ¿Deseas iniciar sesión desde el diálogo general? Haz clic aquí
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <div className="bg-[#2C1E14] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#3D2C1F] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#D8C7BA] bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9E6B38]" />
              Panel de Control Central
            </span>
            <span className="text-[11px] text-[#D8C7BA]">
              • Purificación, Tolima
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-white tracking-tight">
            Administración Pata Amiga
          </h1>
          <p className="text-xs sm:text-sm text-[#D8C7BA]">
            Bienvenida <strong>{currentUser.name}</strong>. Control de usuarios registrados, animales en adopción, reportes ciudadanos y brigadas (límite 25 cupos).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="admin-notif-center-btn"
            onClick={() => setActiveAdminTab('notificaciones')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'notificaciones'
                ? 'bg-[#9E6B38] text-white border-[#B8824C] shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Buzón exclusivo de notificaciones de usuarios"
          >
            <Bell className="w-4 h-4 text-[#E8A868]" />
            <span>Notificaciones</span>
            {adminNotifications.filter(n => !n.read).length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {adminNotifications.filter(n => !n.read).length} nuevas
              </span>
            ) : (
              <span className="text-[10px] text-[#D8C7BA]">
                ({adminNotifications.length})
              </span>
            )}
          </button>

          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{reportsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Reportes</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{appsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Postulaciones</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{contactMessages.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Mensajes</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{eventsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Brigadas</span>
          </div>
        </div>
      </div>

      {/* Live Admin Incoming Alerts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Reportes Alert Card */}
        <div 
          onClick={() => {
            setActiveAdminTab('reportes');
            setReportStatusFilter('recibido');
          }}
          className="bg-white p-3.5 rounded-2xl border border-[#EAE2D5] hover:border-red-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6E574B] uppercase block">
                Reportes Ciudadanos
              </span>
              <span className="text-sm font-bold text-[#2C1E14]">
                {reportsList.filter(r => r.status === 'recibido' || r.status === 'en_camino').length} por atender
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#9E6B38] hover:underline flex items-center gap-0.5">
            Ver <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Postulaciones Alert Card */}
        <div 
          onClick={() => setActiveAdminTab('solicitudes')}
          className="bg-white p-3.5 rounded-2xl border border-[#EAE2D5] hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6E574B] uppercase block">
                Postulaciones Adopción
              </span>
              <span className="text-sm font-bold text-[#2C1E14]">
                {appsList.filter(a => a.status === 'pendiente').length} por evaluar
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#9E6B38] hover:underline flex items-center gap-0.5">
            Revisar <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Mensajes Alert Card */}
        <div 
          onClick={() => setActiveAdminTab('mensajes')}
          className="bg-white p-3.5 rounded-2xl border border-[#EAE2D5] hover:border-[#9E6B38] hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#9E6B38] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6E574B] uppercase block">
                Mensajes de Usuarios
              </span>
              <span className="text-sm font-bold text-[#2C1E14]">
                {contactMessages.filter(m => !m.read).length} sin leer
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#9E6B38] hover:underline flex items-center gap-0.5">
            Leer <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Buzón Alert Card */}
        <div 
          onClick={() => setActiveAdminTab('notificaciones')}
          className="bg-white p-3.5 rounded-2xl border border-[#EAE2D5] hover:border-[#B8824C] hover:shadow-xs transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#9E6B38] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6E574B] uppercase block">
                Buzón Administrativo
              </span>
              <span className="text-sm font-bold text-[#2C1E14]">
                {adminNotifications.filter(n => !n.read).length} avisos nuevos
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#9E6B38] hover:underline flex items-center gap-0.5">
            Buzón <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FAF6F0] p-1.5 rounded-2xl sm:rounded-full border border-[#E8DFD3] overflow-x-auto no-scrollbar sm:flex-wrap">
        {[
          { 
            id: 'notificaciones', 
            label: `Buzón Notificaciones (${adminNotifications.length})`, 
            icon: Bell, 
            count: adminNotifications.filter(n => !n.read).length 
          },
          { 
            id: 'reportes', 
            label: `Reportes Ciudadanos (${reportsList.length})`, 
            icon: AlertCircle, 
            count: reportsList.filter(r => r.status === 'recibido' || r.status === 'en_camino').length 
          },
          { 
            id: 'solicitudes', 
            label: `Solicitudes Adopción (${appsList.length})`, 
            icon: UserCheck, 
            count: appsList.filter(a => a.status === 'pendiente').length 
          },
          { 
            id: 'mensajes', 
            label: `Mensajes de Contacto (${contactMessages.length})`, 
            icon: Mail, 
            count: contactMessages.filter(m => !m.read).length 
          },
          { 
            id: 'brigadas', 
            label: `Modificar Brigadas (${eventsList.length})`, 
            icon: Calendar, 
            count: 0 
          },
          { 
            id: 'adopciones', 
            label: `Animales en Adopción (${petsList.length})`, 
            icon: Heart, 
            count: 0 
          },
          { 
            id: 'usuarios', 
            label: `Personas Registradas (${usersList.length})`, 
            icon: Users, 
            count: 0 
          },
          { 
            id: 'historias', 
            label: `Historias Rescate (${storiesList.length})`, 
            icon: BookOpen, 
            count: 0 
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => {
                setActiveAdminTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#9E6B38] text-white shadow-xs'
                  : 'text-[#6E574B] hover:text-[#2C1E14] hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: BUZÓN DE NOTIFICACIONES DE USUARIOS (Reportes, Adopciones, Mensajes) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'notificaciones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FAF0E6] text-[#9E6B38] rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Buzón Interno de Notificaciones ({adminNotifications.length})
                </h2>
              </div>
              <p className="text-xs text-[#6E574B] max-w-2xl">
                Acceso exclusivo para administradores autorizados. Cada nuevo reporte ciudadano o postulación de adopción en Purificación se registra en este buzón interno y se despacha de forma simultánea a la cuenta de correo de cada administrador.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
              <button
                onClick={handleTestRealEmailDispatch}
                disabled={isTestingEmail}
                className="px-3.5 py-2 bg-[#9E6B38] hover:bg-[#855728] text-white text-xs font-semibold rounded-full cursor-pointer transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Probar despacho real a las bandejas de correo de las administradoras"
              >
                {isTestingEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isTestingEmail ? 'Verificando...' : 'Probar Envío al Correo'}</span>
              </button>

              <button
                onClick={() => setShowEmailConfigModal(true)}
                className="px-3.5 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3] text-[#5C4538] text-xs font-semibold rounded-full cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                title="Ver estado de conexión y configuración para recibir correos reales"
              >
                <Key className="w-3.5 h-3.5 text-[#9E6B38]" />
                <span>Configuración de Correo</span>
              </button>

              {adminNotifications.filter(n => !n.read).length > 0 && (
                <button
                  onClick={handleMarkAllAdminNotifsRead}
                  className="px-3.5 py-2 bg-[#2C1E14] hover:bg-[#3D2C1F] text-white text-xs font-semibold rounded-full cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                  title="Marcar todas las alertas como leídas"
                >
                  <CheckCheck className="w-4 h-4 text-[#9E6B38]" />
                  <span>Marcar todo leído ({adminNotifications.filter(n => !n.read).length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Email Dispatch System Gateway Banner */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition ${
            emailServerStatus?.configured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                  emailServerStatus?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                }`}></span>
                <span className="font-bold text-sm">
                  {emailServerStatus?.configured
                    ? `🟢 Despacho Real a Gmail ACTIVO (${emailServerStatus.provider.toUpperCase()})`
                    : '🟡 Servidor Listo • Pendiente Credencial de Gmail para Salida Externa'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={fetchEmailStatus}
                  className="px-2.5 py-1 bg-white/80 hover:bg-white border border-black/10 rounded-full text-[11px] font-semibold text-[#5C4538] transition cursor-pointer flex items-center gap-1"
                  title="Comprobar estado del servidor de correos"
                >
                  <RefreshCw className="w-3 h-3 text-[#9E6B38]" />
                  <span>Revisar Estado</span>
                </button>
                <button
                  onClick={() => setShowEmailConfigModal(true)}
                  className="px-2.5 py-1 bg-[#9E6B38] hover:bg-[#855728] text-white rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>{emailServerStatus?.configured ? 'Ver Detalles' : 'Cómo Activar Gmail'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-[#5C4538]">
              {emailServerStatus?.configured ? (
                <>
                  Los reportes de rescate y solicitudes de adopción se despachan automáticamente a las bandejas de entrada de las administradoras desde la cuenta <strong>{emailServerStatus.account}</strong>.
                </>
              ) : (
                <>
                  Todas las alertas se registran de inmediato en este <strong>buzón administrativo</strong>. Para que además lleguen a tu bandeja personal de Gmail (como <code>gascadanna414@gmail.com</code> o <code>marimasmela15@gmail.com</code>), solo debes añadir la contraseña de aplicación de Gmail en las variables de entorno, o utilizar el botón <strong>«Abrir en Gmail (1 Clic)»</strong> incluido en cada tarjeta.
                </>
              )}
            </p>

            <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6E574B]">
              <div>
                <strong>Bandejas autorizadas ({StoreController.getAdminEmails().length}):</strong>{' '}
                {StoreController.getAdminEmails().join(', ')}
              </div>
              <span className="font-semibold text-[#9E6B38]">
                Purificación, Tolima
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8DFD3]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'todos', label: 'Todas las Alertas', count: adminNotifications.length },
                { id: 'adopciones', label: '🐾 Postulaciones Adopción', count: adminNotifications.filter(n => n.type === 'adopcion').length },
                { id: 'reportes', label: '🚨 Reportes Ciudadanos', count: adminNotifications.filter(n => n.type === 'reporte').length },
                { id: 'mensajes', label: '📩 Mensajes y Sistema', count: adminNotifications.filter(n => n.type === 'sistema').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setAdminNotifFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    adminNotifFilter === f.id
                      ? 'bg-[#9E6B38] text-white shadow-xs'
                      : 'bg-white text-[#6E574B] hover:bg-white/80 border border-[#E8DFD3]'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    adminNotifFilter === f.id ? 'bg-white/20 text-white' : 'bg-[#FAF6F0] text-[#8A7568]'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#2C1E14] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={adminNotifOnlyUnread}
                onChange={e => setAdminNotifOnlyUnread(e.target.checked)}
                className="w-4 h-4 rounded text-[#9E6B38] focus:ring-[#9E6B38]"
              />
              <span>Solo no leídas ({adminNotifications.filter(n => !n.read).length})</span>
            </label>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {(() => {
              const filteredNotifs = adminNotifications.filter(notif => {
                if (adminNotifOnlyUnread && notif.read) return false;
                if (adminNotifFilter === 'reportes' && notif.type !== 'reporte') return false;
                if (adminNotifFilter === 'adopciones' && notif.type !== 'adopcion') return false;
                if (adminNotifFilter === 'mensajes' && notif.type !== 'sistema') return false;
                return true;
              });

              if (filteredNotifs.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-2xl border border-[#EAE2D5] text-center space-y-2">
                    <Inbox className="w-10 h-10 text-[#D8C7BA] mx-auto opacity-60" />
                    <h3 className="text-sm font-bold text-[#2C1E14]">
                      No hay notificaciones en este filtro
                    </h3>
                    <p className="text-xs text-[#8A7568] max-w-sm mx-auto">
                      Cuando los usuarios envíen reportes de rescate, solicitudes de adopción o mensajes, aparecerán organizadas aquí y se enviará la notificación por correo a cada administrador.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredNotifs.map(notif => {
                    const isReport = notif.type === 'reporte';
                    const isAdoption = notif.type === 'adopcion';
                    const isSystem = notif.type === 'sistema';

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 shadow-xs ${
                          notif.read
                            ? 'bg-white border-[#EAE2D5]'
                            : 'bg-[#FFFDF9] border-[#9E6B38]/40 ring-1 ring-[#9E6B38]/20'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isReport 
                                ? 'bg-red-100 text-red-800' 
                                : isAdoption 
                                  ? 'bg-amber-100 text-amber-900' 
                                  : 'bg-blue-100 text-blue-900'
                            }`}>
                              {isReport ? (
                                <AlertCircle className="w-3 h-3" />
                              ) : isAdoption ? (
                                <Heart className="w-3 h-3" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              <span>
                                {isReport 
                                  ? '🚨 Reporte Ciudadano' 
                                  : isAdoption 
                                    ? '🐾 Postulación de Adopción' 
                                    : '📩 Mensaje / Sistema'}
                              </span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[#8A7568] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#9E6B38]" />
                                {notif.timestamp}
                              </span>
                              {!notif.read && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600 text-white animate-pulse">
                                  NUEVA
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#2C1E14]">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-[#5C4538] mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>

                          {/* Email Dispatch Status Details */}
                          {notif.emailDispatch ? (
                            <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E8DFD3] text-xs space-y-2">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-[#2C1E14] flex items-center gap-1.5">
                                  <MailCheck className={`w-3.5 h-3.5 ${
                                    notif.emailDispatch.status === 'entregado' ? 'text-emerald-600' : 'text-[#9E6B38]'
                                  }`} />
                                  <span>Despacho a Correos de Administradores</span>
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  notif.emailDispatch.status === 'entregado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : notif.emailDispatch.status === 'pendiente_configuracion'
                                      ? 'bg-amber-100 text-amber-900'
                                      : notif.emailDispatch.status === 'fallido'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {notif.emailDispatch.status === 'entregado'
                                    ? `Entregado (${notif.emailDispatch.provider?.toUpperCase() || 'Gmail'})`
                                    : notif.emailDispatch.status === 'pendiente_configuracion'
                                      ? 'Buzón Interno • Falta activar Gmail SMTP'
                                      : notif.emailDispatch.status === 'fallido'
                                        ? 'Error de Despacho'
                                        : 'Despachado'}
                                </span>
                              </div>

                              <p className="text-[10px] text-[#6E574B] truncate" title={notif.emailDispatch.recipients.join(', ')}>
                                <strong>Destinatarios ({notif.emailDispatch.recipients.length}):</strong> {notif.emailDispatch.recipients.join(', ')}
                              </p>

                              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8A7568] pt-1.5 border-t border-[#EAE2D5]">
                                <span>Fecha: {notif.emailDispatch.sentAt}</span>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenGmailWeb(notif)}
                                    className="px-2.5 py-1 bg-white hover:bg-[#F5EDE2] text-[#9E6B38] border border-[#D8C7B5] rounded-md font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs"
                                    title="Abrir Gmail Web con mensaje y los 4 correos listos para enviar"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>Abrir en Gmail (1 Clic)</span>
                                  </button>

                                  <button
                                    onClick={() => handleResendAdminEmail(notif.id)}
                                    className="text-[#6E574B] hover:text-[#2C1E14] font-medium hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    <Send className="w-2.5 h-2.5" />
                                    <span>Reenviar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DFD3] flex items-center justify-between text-[10px]">
                              <span className="text-[#6E574B] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#9E6B38]" />
                                <span>Canal de alerta multi-administrador</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenGmailWeb(notif)}
                                  className="text-[#9E6B38] font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  <span>Abrir en Gmail</span>
                                </button>
                                <button
                                  onClick={() => handleResendAdminEmail(notif.id)}
                                  className="text-[#6E574B] font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Send className="w-2.5 h-2.5" />
                                  <span>Despachar</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#F5EDE2] flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleNavigateFromNotif(notif)}
                            className="px-3 py-1.5 bg-[#2C1E14] hover:bg-[#3D2C1F] text-white text-xs font-semibold rounded-full cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                          >
                            {isReport ? (
                              <span>🚨 Atender Reporte</span>
                            ) : isAdoption ? (
                              <span>🐾 Evaluar Postulación</span>
                            ) : (
                              <span>📩 Ver en Panel</span>
                            )}
                            <ArrowRight className="w-3 h-3 text-[#9E6B38]" />
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleAdminNotifRead(notif.id, notif.read)}
                              className="p-1.5 text-[#6E574B] hover:text-[#2C1E14] hover:bg-[#FAF6F0] rounded-lg transition cursor-pointer"
                              title={notif.read ? 'Marcar como no leído' : 'Marcar como leído'}
                            >
                              {notif.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteAdminNotif(notif.id)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: REPORTES CIUDADANOS (Ver y modificar estados de atención) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'reportes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Reportes Ciudadanos de Rescate ({reportsList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Revisa los casos enviados por la comunidad de Purificación con evidencia fotográfica y teléfonos de contacto de 10 dígitos.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="recibido">Recibido</option>
                <option value="en_camino">En Camino</option>
                <option value="en_atencion">En Atención</option>
                <option value="rescatado">Rescatado</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#8A7568] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar barrio, animal..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsList
              .filter(rep => {
                const matchQuery = !searchQuery || 
                  rep.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rep.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rep.reporterPhone.includes(searchQuery);
                const matchStatus = reportStatusFilter === 'todos' || rep.status === reportStatusFilter;
                return matchQuery && matchStatus;
              })
              .map(report => {
                const isUrgent = report.urgency === 'urgente';
                const mainPhoto = report.photos && report.photos.length > 0 ? report.photos[0] : (report.photoUrl || '/images/hades_rescue_1788225379594.jpg');

                return (
                  <div 
                    key={report.id}
                    className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      {/* Photo Header with Urgency Badge */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#2C1E14]">
                        <img 
                          src={resolveImageUrl(mainPhoto, 'dog')} 
                          alt={`Reporte ${report.animalType}`}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, 'dog')}
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase ${
                          isUrgent ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                        }`}>
                          {report.urgency}
                        </span>
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">
                          {report.animalType}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2C1E14]">{report.neighborhood}</span>
                          <span className="text-[#8A7568] text-[11px]">{report.reportedAt}</span>
                        </div>
                        <p className="text-xs text-[#5C4538] line-clamp-2">
                          {report.description}
                        </p>
                      </div>

                      {/* Reporter Info with 10-digit Phone */}
                      <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DFD3] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#2C1E14]">
                            Informante: {report.reporterName}
                          </span>
                          <span className="font-mono text-[11px] text-[#9E6B38] font-bold">
                            {formatPhone10(report.reporterPhone)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-[#E8DFD3]">
                          <a 
                            href={`tel:${sanitizePhone10(report.reporterPhone)}`}
                            className="text-[11px] font-semibold text-[#9E6B38] hover:text-[#86582A] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>
                          <span className="text-[#D5C8B8]">•</span>
                          <a 
                            href={`https://wa.me/57${sanitizePhone10(report.reporterPhone)}?text=Hola%20${encodeURIComponent(report.reporterName)},%20te%20escribimos%20desde%20Pata%20Amiga%20Purificaci%C3%B3n%20sobre%20el%20reporte%20de%20rescate.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-[#8A7568]">
                          Estado del Rescate:
                        </label>
                        <select
                          value={report.status}
                          onChange={(e) => handleUpdateReportStatus(report.id, e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#2C1E14]"
                        >
                          <option value="recibido">🟡 Recibido (Por atender)</option>
                          <option value="en_camino">🚚 En camino a rescatar</option>
                          <option value="en_atencion">🏥 En atención veterinaria</option>
                          <option value="rescatado">✅ Rescatado / Recuperado</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
                      <button
                        onClick={() => setSelectedReportDetail(report)}
                        className="text-xs font-semibold text-[#9E6B38] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver evidencia ({report.photos?.length || 1} fotos)</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id, report.neighborhood, report.animalType)}
                        className="text-xs text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Eliminar reporte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERSONAS REGISTRADAS (Ver personas que fueron registradas) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Personas Registradas en la Plataforma ({usersList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Directorio completo de ciudadanos, adoptantes, voluntarios, rescatistas y administradores.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              >
                <option value="todos">Todos los Roles</option>
                <option value="admin">Administradores</option>
                <option value="rescatista">Rescatistas</option>
                <option value="voluntario">Voluntarios</option>
                <option value="ciudadano">Ciudadanos</option>
              </select>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#8A7568] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar nombre, correo o teléfono..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>

              <button
                id="admin-add-user-btn"
                onClick={() => {
                  setUserModalError(null);
                  setIsAddingUser(true);
                }}
                className="px-3.5 py-1.5 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Persona</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#FAF6F0] text-[#6E574B] uppercase tracking-wider font-bold border-b border-[#E8DFD3]">
                  <tr>
                    <th className="px-4 py-3">Nombre Completo</th>
                    <th className="px-4 py-3">Correo Electrónico</th>
                    <th className="px-4 py-3">Teléfono / Celular</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Fecha Registro</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EDE2]">
                  {usersList
                    .filter(u => {
                      const matchQuery = !searchQuery || 
                        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (u.phone && u.phone.includes(searchQuery));
                      const matchRole = roleFilter === 'todos' || u.role === roleFilter;
                      return matchQuery && matchRole;
                    })
                    .map(user => {
                      const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
                      const waPhone = cleanPhone.startsWith('57') ? cleanPhone : cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;

                      return (
                        <tr key={user.id} className="hover:bg-[#FAF6F0]/60 transition">
                          <td className="px-4 py-3.5 font-bold text-[#2C1E14] flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold">{user.name}</span>
                              <span className="text-[10px] text-[#8A7568]">{user.location || 'Purificación, Tolima'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[#5C4538] font-mono text-[11px]">
                            {user.email}
                          </td>
                          <td className="px-4 py-3.5 text-[#2C1E14] font-semibold">
                            {user.phone ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#9E6B38] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E8DFD3]">
                                  {user.phone}
                                </span>
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 p-1"
                                  title="Escribir por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[#8A7568] italic">No registrado</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                              className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer ${
                                user.role === 'admin'
                                  ? 'bg-[#2C1E14] text-[#FAF6F0] border-black'
                                  : user.role === 'rescatista'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : user.role === 'voluntario'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-stone-100 text-stone-800 border-stone-300'
                              }`}
                            >
                              <option value="ciudadano">Ciudadano</option>
                              <option value="voluntario">Voluntario</option>
                              <option value="rescatista">Rescatista</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5 text-[#8A7568]">
                            {user.registeredAt || user.createdAt || 'Reciente'}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleToggleAdminRole(user.id)}
                              className="px-2 py-1 bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] rounded-lg text-[11px] font-semibold text-[#9E6B38] cursor-pointer"
                              title="Alternar permisos de administrador"
                            >
                              {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                            </button>
                            {user.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ANIMALES EN ADOPCIÓN (Modificar y Añadir) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'adopciones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Catálogo de Animales en Adopción ({petsList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Añade nuevos animales rescatados, modifica historias, fotografías, estado de vacunación y gestiona adopciones.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              >
                <option value="todos">Todas las Especies</option>
                <option value="Perro">Perros</option>
                <option value="Gato">Gatos</option>
              </select>

              <button
                id="admin-add-pet-btn"
                onClick={() => setEditingPet({
                  name: '',
                  species: 'Perro',
                  breed: 'Criollo Tolimense',
                  gender: 'Macho',
                  age: '1 año',
                  size: 'Mediano',
                  story: 'Rescatado en Purificación, Tolima. Listo para encontrar un hogar amoroso y responsable.',
                  healthStatus: {
                    vaccinated: true,
                    sterilized: true,
                    dewormed: true,
                    specialCareNotes: 'Desparasitado y con vacunas al día.'
                  },
                  personality: ['Cariñoso', 'Juguetón'],
                  photos: ['/images/mateo_rescue_story_1788226480262.jpg'],
                  status: 'disponible',
                  rescuerName: 'Equipo Pata Amiga Purificación',
                  rescuerContact: '3128904521',
                  rescuerLocation: 'Purificación, Tolima',
                  featured: true
                })}
                className="px-4 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>＋ Añadir Nuevo Animal</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {petsList
              .filter(p => speciesFilter === 'todos' || p.species === speciesFilter)
              .map(pet => (
                <div 
                  key={pet.id}
                  className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#9E6B38] transition"
                >
                  <div className="p-3 space-y-2">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1E14]">
                      <img
                        src={resolveImageUrl(pet.photos[0], pet.species === 'Gato' ? 'cat' : 'dog')}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, pet.species === 'Gato' ? 'cat' : 'dog')}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">
                        {pet.species} • {pet.age}
                      </span>
                      <button
                        onClick={() => handleQuickTogglePetStatus(pet)}
                        className={`absolute bottom-2 right-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white cursor-pointer shadow-xs transition ${
                          pet.status === 'disponible' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                        title="Clic para cambiar estado de adopción"
                      >
                        {pet.status.toUpperCase()}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#2C1E14]">
                        {pet.name} <span className="text-xs font-normal text-[#8A7568]">({pet.breed})</span>
                      </h3>
                      <p className="text-xs text-[#5C4538] line-clamp-2 mt-1">
                        {pet.story}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {pet.healthStatus?.sterilized && (
                        <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                          Esterilizado
                        </span>
                      )}
                      {pet.healthStatus?.vaccinated && (
                        <span className="text-[9px] font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                          Vacunado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
                    <span className="text-[11px] text-[#8A7568]">
                      Tel: {formatPhone10(pet.rescuerContact || '3128904521')}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingPet(pet)}
                        className="px-2.5 py-1 text-[#5C4538] hover:text-[#2C1E14] bg-white rounded-lg border border-[#E8DFD3] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Modificar ficha"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id, pet.name, `${pet.species} • ${pet.breed} (${pet.age})`)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                        title="Eliminar animal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MODIFICAR EVENTOS Y BRIGADAS (Límite: 25 cupos) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'brigadas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Modificar y Gestionar Brigadas de Salud ({eventsList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Crea nuevas jornadas, edita fechas y lugares en Purificación, y consulta la lista de los 25 inscritos por evento.
              </p>
            </div>
            <button
              id="admin-add-event-btn"
              onClick={() => setEditingEvent({
                title: '',
                date: 'Próximo Sábado 20 de Octubre',
                time: '08:00 AM - 02:00 PM',
                locationName: 'Polideportivo Municipal',
                address: 'Barrio El Ospina Pérez, Purificación, Tolima',
                type: 'esterilizacion',
                isFree: true,
                totalSpots: 25,
                contactPhone: '3128904521',
                description: 'Jornada integral comunitaria con esterilización, vacunación antirrábica y desparasitación con cupo límite de 25 personas.',
                requirements: [
                  'Mascota en ayuno de 8 horas de sólidos y 4 horas de líquidos.',
                  'Llevar caninos con collar/bozal y felinos en guacal o canastilla.',
                  'Tutor responsable mayor de edad con cédula de ciudadanía.'
                ]
              })}
              className="px-4 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>＋ Crear Nueva Brigada</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsList.map(event => {
              const spotsLeft = 25 - (event.registeredCount || 0);
              const eventRegs = registrationsList.filter(r => r.eventId === event.id);

              return (
                <div 
                  key={event.id}
                  className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#9E6B38] transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2C1E14] text-white">
                        {event.type}
                      </span>
                      {spotsLeft <= 0 ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          Cupos agotados (25/25)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#9E6B38] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#E8DFD3]">
                          {event.registeredCount}/25 cupos ({spotsLeft} libres)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                      {event.title}
                    </h3>

                    <div className="text-xs text-[#6E574B] space-y-1 bg-[#FAF6F0] p-3 rounded-xl border border-[#E8DFD3]">
                      <p><strong>🗓️ Fecha:</strong> {event.date}</p>
                      <p><strong>⏰ Horario:</strong> {event.time}</p>
                      <p><strong>📍 Lugar:</strong> {event.locationName} ({event.address})</p>
                      <p><strong>📞 Contacto:</strong> {formatPhone10(event.contactPhone || '3128904521')}</p>
                    </div>

                    <p className="text-xs text-[#5C4538] leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="border-t border-[#F5EDE2] pt-3 flex items-center justify-between">
                    <button
                      onClick={() => setViewingRegistrationsEventId(event.id)}
                      className="text-xs font-bold text-[#9E6B38] hover:text-[#86582A] cursor-pointer flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#E8DFD3]"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Ver inscritos ({eventRegs.length}/25)</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-1.5 text-[#5C4538] hover:bg-[#FAF6F0] rounded-lg border border-[#E8DFD3] cursor-pointer"
                        title="Modificar brigada"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                        title="Eliminar brigada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SOLICITUDES DE ADOPCIÓN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'solicitudes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Postulaciones de Adopción ({appsList.length})
            </h2>
            <p className="text-xs text-[#6E574B]">
              Revisa los postulantes para cada animal y aprueba o rechaza solicitudes de adopción.
            </p>
          </div>

          <div className="space-y-3">
            {appsList.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#EAE2D5] text-center text-xs text-[#8A7568]">
                No hay solicitudes de adopción pendientes por el momento.
              </div>
            ) : (
              appsList.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-2xl border border-[#EAE2D5] shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2C1E14]">{app.applicantName}</span>
                      <span className="text-xs text-[#9E6B38] font-bold">postula para: {app.petName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'aprobada' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'rechazada' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E574B]">
                      📞 Teléfono (10 dígitos): <strong>{formatPhone10(app.applicantPhone)}</strong> • ✉️ {app.applicantEmail} • 📍 {app.applicantCity} ({app.housingType})
                    </p>
                    <p className="text-xs text-[#5C4538] italic bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DFD3]">
                      "{app.reasonForAdoption}"
                    </p>
                    <span className="text-[10px] text-[#8A7568] block">Fecha de envío: {app.submittedAt}</span>

                    {app.statusNote && (
                      <div className="text-xs bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DFD3] text-[#5C4538] space-y-1 mt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#9E6B38]">
                          <span>💬 Notificación / Mensaje enviado al usuario:</span>
                          {app.reviewedAt && (
                            <span className="text-[#8A7568] font-normal">Revisado: {app.reviewedAt}</span>
                          )}
                        </div>
                        <p className="italic">"{app.statusNote}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => {
                        setReviewAppModal({ app, action: 'aprobada' });
                        setReviewCustomNote(`¡Felicidades, ${app.applicantName}! Tu postulación para adoptar a ${app.petName} fue aprobada con éxito por la administración de Pata Amiga Purificación. Nos comunicaremos contigo al ${formatPhone10(app.applicantPhone)} para coordinar la entrega y firma del acta de adopción.`);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full cursor-pointer transition shadow-xs flex items-center gap-1"
                      title="Aprobar postulación y enviar notificación al usuario"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setReviewAppModal({ app, action: 'rechazada' });
                        setReviewCustomNote(`Hola ${app.applicantName}, gracias por postularte para adoptar a ${app.petName}. En esta oportunidad la solicitud no pudo ser aprobada por el equipo evaluador. Te invitamos a conocer otros peluditos en Purificación.`);
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full cursor-pointer transition shadow-xs flex items-center gap-1"
                      title="Rechazar postulación y notificar al usuario"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(app.id, app.applicantName, app.petName)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                      title="Eliminar postulación de adopción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: HISTORIAS DE RESCATE */}
      {/* ========================================================================= */}
      {activeAdminTab === 'historias' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Historias de Transformación y Rescate ({storiesList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Publica y edita los casos de antes y después de los animales recuperados en Purificación.
              </p>
            </div>
            <button
              onClick={() => setEditingStory({
                petName: '',
                species: 'Perro',
                breed: 'Criollo Tolimense',
                estimatedAge: '1 año',
                rescueLocation: 'Purificación, Tolima',
                rescueStory: 'Fue encontrado en estado vulnerable en Purificación.',
                adoptionStory: 'Hoy vive feliz con una familia adoptante en el Tolima.',
                healthBefore: 'Desnutrido y con lesiones',
                healthAfter: 'Totalmente recuperado, vacunado y feliz',
                beforePhotoUrl: '/images/hades_rescue_1788225379594.jpg',
                currentPhotoUrl: '/images/hades_rescue_1788225379594.jpg',
                rescuerName: 'Equipo Pata Amiga Purificación'
              })}
              className="px-4 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nueva Historia</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storiesList.map(story => (
              <div 
                key={story.id}
                className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1E14]">
                      <img
                        src={resolveImageUrl(story.beforePhotoUrl, 'before')}
                        alt={`Antes ${story.petName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, 'before')}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-white">
                        Antes
                      </span>
                    </div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1E14]">
                      <img
                        src={resolveImageUrl(story.currentPhotoUrl, 'after')}
                        alt={`Después ${story.petName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, 'after')}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#9E6B38] text-white">
                        Ahora
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#2C1E14]">
                    {story.petName} ({story.breed})
                  </h3>
                  <p className="text-xs text-[#5C4538] line-clamp-2">
                    {story.adoptionStory}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A7568]">
                    ❤️ {story.likes} apoyos
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStory(story)}
                      className="p-1 text-[#5C4538] hover:bg-white rounded border border-[#E8DFD3] cursor-pointer"
                      title="Editar historia"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id, story.petName)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                      title="Eliminar historia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: MENSAJES DE CONTACTO CIUDADANO (Buzón de Atención) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'mensajes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Buzón de Mensajes de Contacto ({contactMessages.length})
                </h2>
                {contactMessages.filter(m => !m.read).length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                    {contactMessages.filter(m => !m.read).length} sin leer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E574B]">
                Consultas, solicitudes de rescate y mensajes enviados por la comunidad a través del formulario de contacto.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={messageFilter}
                onChange={(e) => setMessageFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              >
                <option value="todos">Todos los mensajes</option>
                <option value="no_leidos">Solo no leídos</option>
                <option value="leidos">Solo leídos</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#8A7568] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar remitente, asunto o texto..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {contactMessages
              .filter(msg => {
                const matchFilter = 
                  messageFilter === 'todos' || 
                  (messageFilter === 'no_leidos' && !msg.read) || 
                  (messageFilter === 'leidos' && msg.read);

                const matchQuery = !searchQuery ||
                  msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  msg.phone.includes(searchQuery) ||
                  msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  msg.message.toLowerCase().includes(searchQuery.toLowerCase());

                return matchFilter && matchQuery;
              })
              .map(msg => {
                const cleanPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, '') : '';
                const waPhone = cleanPhone.startsWith('57') ? cleanPhone : cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;

                return (
                  <div 
                    key={msg.id}
                    className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                      !msg.read ? 'border-[#9E6B38] ring-1 ring-[#9E6B38]/20 bg-[#FDFBF7]' : 'border-[#EAE2D5]'
                    }`}
                  >
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Top bar: Sender info & status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E8DC] pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#2C1E14]">{msg.name}</span>
                              {!msg.read ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                  Nuevo
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium bg-[#FAF6F0] text-[#8A7568] px-2 py-0.5 rounded-full border border-[#E8DFD3]">
                                  Leído
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8A7568] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#9E6B38]" />
                              {msg.submittedAt}
                            </span>
                          </div>
                        </div>

                        {/* Contact details tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#EFE6DA] text-[#5C4538] rounded-lg border border-[#E8DFD3] transition"
                            title="Enviar correo"
                          >
                            <Mail className="w-3 h-3 text-[#9E6B38]" />
                            <span className="font-mono text-[11px]">{msg.email}</span>
                          </a>

                          {msg.phone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${msg.name}, te escribimos desde Pata Amiga Purificación respecto a tu mensaje sobre "${msg.subject}".`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition font-semibold text-[11px]"
                              title="Responder por WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono">{msg.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Subject and body */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-[#9E6B38] uppercase tracking-wide flex items-center gap-1.5">
                          <span>Asunto:</span>
                          <span className="text-[#2C1E14] font-semibold normal-case text-sm">{msg.subject}</span>
                        </div>
                        <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E8DFD3] text-xs text-[#4A382D] leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && (
                            <button
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#EFE6DA] text-[#5C4538] hover:text-[#2C1E14] text-xs font-semibold rounded-lg border border-[#D5C8B8] flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Marcar como leído</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {msg.phone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${msg.name}, te escribimos desde Pata Amiga Purificación respecto a tu consulta: ${msg.subject}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="px-3 py-1.5 bg-[#9E6B38] hover:bg-[#86582A] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Responder</span>
                          </a>
                          <button
                            onClick={() => handleDeleteContactMessage(msg.id, msg.name, msg.subject)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {contactMessages.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[#EAE2D5] text-center space-y-2">
                <Mail className="w-8 h-8 text-[#8A7568] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1E14]">No hay mensajes de contacto registrados aún</h3>
                <p className="text-xs text-[#6E574B]">
                  Los mensajes que los ciudadanos envíen mediante el formulario de contacto aparecerán automáticamente aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NUEVO USUARIO */}
      {/* ========================================================================= */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Registrar Nueva Persona
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userModalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
                {userModalError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Ej. Laura Marcela Pérez"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">
                  Teléfono / Celular *
                </label>
                <PhoneInput
                  id="admin-create-user-phone"
                  value={newUserPhone}
                  onChange={setNewUserPhone}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Rol Asignado</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  >
                    <option value="ciudadano">Ciudadano</option>
                    <option value="voluntario">Voluntario</option>
                    <option value="rescatista">Rescatista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Contraseña (mínimo 4 car.) *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#2C1E14]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold shadow-xs"
              >
                Registrar Persona
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODIFICAR/CREAR BRIGADA DE SALUD (Límite 25) */}
      {/* ========================================================================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEvent} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                {editingEvent.id ? 'Modificar Brigada de Salud' : 'Crear Nueva Brigada'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Título de la Jornada *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Ej. Gran Jornada de Esterilización y Vacunación Barrio El Ospina"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Tipo de Evento</label>
                  <select
                    value={editingEvent.type || 'esterilizacion'}
                    onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  >
                    <option value="esterilizacion">Esterilización</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="brigada_salud">Brigada Integral</option>
                    <option value="donacion_alimento">Donación de Alimento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">
                    Teléfono de Contacto <span className="text-[10px] text-[#8A7568] font-normal">(10 dígitos)</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editingEvent.contactPhone || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, contactPhone: sanitizePhone10(e.target.value) })}
                    placeholder="3128904521"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Fecha *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="Ej. Sábado 28 de Octubre"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Horario *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.time || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    placeholder="Ej. 08:00 AM - 02:00 PM"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Lugar en Purificación *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.locationName || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, locationName: e.target.value })}
                  placeholder="Ej. Polideportivo Municipal / Salón Comunal Barrio Santander"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Dirección / Referencia</label>
                <input
                  type="text"
                  value={editingEvent.address || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, address: e.target.value })}
                  placeholder="Ej. Carrera 5 con Calle 8, Purificación, Tolima"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Descripción de la Brigada</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Detalles sobre cupos, servicios gratuitos y recomendaciones..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Capacidad fija automática: <strong>25 personas máximo por jornada</strong> según normativa comunitaria.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#2C1E14]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold shadow-xs"
              >
                Guardar Brigada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODIFICAR/CREAR ANIMAL EN ADOPCIÓN (AÑADIR) */}
      {/* ========================================================================= */}
      {editingPet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSavePet} className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                {editingPet.id ? `Modificar Ficha de ${editingPet.name}` : 'Añadir Nuevo Animal en Adopción'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPet(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Nombre de la Mascota *</label>
                  <input
                    type="text"
                    required
                    value={editingPet.name || ''}
                    onChange={e => setEditingPet({ ...editingPet, name: e.target.value })}
                    placeholder="Ej. Mateo, Luna, Toby..."
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Especie *</label>
                  <select
                    value={editingPet.species || 'Perro'}
                    onChange={e => setEditingPet({ ...editingPet, species: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  >
                    <option value="Perro">🐶 Perro / Canino</option>
                    <option value="Gato">🐱 Gato / Felino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Raza *</label>
                  <input
                    type="text"
                    required
                    value={editingPet.breed || ''}
                    onChange={e => setEditingPet({ ...editingPet, breed: e.target.value })}
                    placeholder="Ej. Criollo Tolimense"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Edad Estimada</label>
                  <input
                    type="text"
                    value={editingPet.age || ''}
                    onChange={e => setEditingPet({ ...editingPet, age: e.target.value })}
                    placeholder="Ej. 8 meses, 2 años"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Tamaño</label>
                  <select
                    value={editingPet.size || 'Mediano'}
                    onChange={e => setEditingPet({ ...editingPet, size: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector with Presets */}
              <div className="space-y-1.5 bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8DFD3]">
                <label className="block font-semibold text-[#2C1E14]">
                  Foto Principal del Animal
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_PET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingPet({
                        ...editingPet,
                        photos: [preset.url]
                      })}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        editingPet.photos && editingPet.photos[0] === preset.url
                          ? 'bg-[#9E6B38] text-white border-[#9E6B38] font-bold'
                          : 'bg-white text-[#5C4538] border-[#E8DFD3] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editingPet.photos && editingPet.photos.length > 0 ? editingPet.photos[0] : ''}
                  onChange={e => setEditingPet({ ...editingPet, photos: [e.target.value] })}
                  placeholder="O ingresa la URL personalizada de la imagen..."
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Historia y Personalidad *</label>
                <textarea
                  rows={3}
                  required
                  value={editingPet.story || ''}
                  onChange={e => setEditingPet({ ...editingPet, story: e.target.value })}
                  placeholder="Describe su historia de rescate en Purificación, comportamiento con niños y otros animales..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              {/* Health Checkboxes */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8DFD3]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPet.healthStatus?.sterilized ?? true}
                    onChange={e => setEditingPet({
                      ...editingPet,
                      healthStatus: {
                        ...(editingPet.healthStatus || { vaccinated: true, dewormed: true, specialCareNotes: '' }),
                        sterilized: e.target.checked
                      }
                    })}
                    className="accent-[#9E6B38] rounded"
                  />
                  <span>Esterilizado(a)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPet.healthStatus?.vaccinated ?? true}
                    onChange={e => setEditingPet({
                      ...editingPet,
                      healthStatus: {
                        ...(editingPet.healthStatus || { sterilized: true, dewormed: true, specialCareNotes: '' }),
                        vaccinated: e.target.checked
                      }
                    })}
                    className="accent-[#9E6B38] rounded"
                  />
                  <span>Vacunado(a)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPet.healthStatus?.dewormed ?? true}
                    onChange={e => setEditingPet({
                      ...editingPet,
                      healthStatus: {
                        ...(editingPet.healthStatus || { sterilized: true, vaccinated: true, specialCareNotes: '' }),
                        dewormed: e.target.checked
                      }
                    })}
                    className="accent-[#9E6B38] rounded"
                  />
                  <span>Desparasitado(a)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Estado de Adopción</label>
                  <select
                    value={editingPet.status || 'disponible'}
                    onChange={e => setEditingPet({ ...editingPet, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  >
                    <option value="disponible">🟢 Disponible para adopción</option>
                    <option value="en_proceso">🟡 En Proceso de evaluación</option>
                    <option value="adoptado">🏠 Adoptado (Finalizado)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">
                    Teléfono Rescatista <span className="text-[10px] text-[#8A7568] font-normal">(10 dígitos)</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editingPet.rescuerContact || '3128904521'}
                    onChange={e => setEditingPet({ ...editingPet, rescuerContact: sanitizePhone10(e.target.value) })}
                    placeholder="3128904521"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setEditingPet(null)}
                className="px-4 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#2C1E14]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold shadow-xs"
              >
                Guardar Ficha de Animal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER INSCRITOS DE LA BRIGADA (25 Cupos) */}
      {/* ========================================================================= */}
      {viewingRegistrationsEventId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <div>
                <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Inscritos en la Brigada ({registrationsList.filter(r => r.eventId === viewingRegistrationsEventId).length}/25 Cupos)
                </h3>
                <p className="text-xs text-[#6E574B]">
                  Lista oficial con teléfonos de 10 dígitos y códigos de confirmación.
                </p>
              </div>
              <button
                onClick={() => setViewingRegistrationsEventId(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {registrationsList.filter(r => r.eventId === viewingRegistrationsEventId).length === 0 ? (
                <p className="text-xs text-[#8A7568] text-center py-8">
                  Aún no hay ciudadanos inscritos en esta brigada.
                </p>
              ) : (
                registrationsList
                  .filter(r => r.eventId === viewingRegistrationsEventId)
                  .map((reg, idx) => (
                    <div key={reg.id} className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-xs flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#2C1E14]">#{idx + 1}. {reg.ownerName}</span>
                        <p className="text-[11px] text-[#6E574B]">
                          Mascota: <strong>{reg.petName}</strong> ({reg.petSpecies}) • Barrio: {reg.ownerNeighborhood || 'Purificación'}
                        </p>
                        <p className="text-[11px] font-mono text-[#9E6B38] font-semibold">
                          📞 {formatPhone10(reg.ownerPhone)} • ✉️ {reg.ownerEmail}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E8DFD3] text-[#9E6B38] font-bold">
                          {reg.confirmationCode}
                        </span>
                        <button
                          onClick={() => handleDeleteAttendee(reg.id, reg.ownerName, reg.petName)}
                          className="text-[10px] text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded"
                          title="Anular inscripción y liberar cupo"
                        >
                          Liberar cupo
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#EAE2D5]">
              <button
                onClick={() => setViewingRegistrationsEventId(null)}
                className="px-5 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold cursor-pointer"
              >
                Cerrar Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER DETALLE DEL REPORTE Y EVIDENCIA FOTOGRÁFICA */}
      {/* ========================================================================= */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <div>
                <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Detalles del Reporte #{selectedReportDetail.id}
                </h3>
                <p className="text-xs text-[#6E574B]">
                  {selectedReportDetail.animalType} en {selectedReportDetail.neighborhood}
                </p>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1 rounded-full hover:bg-[#FAF6F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#9E6B38] uppercase">
                Fotos de Evidencia ({selectedReportDetail.photos?.length || 1})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(selectedReportDetail.photos && selectedReportDetail.photos.length > 0 
                  ? selectedReportDetail.photos 
                  : [selectedReportDetail.photoUrl]
                ).map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#2C1E14] border border-[#E8DFD3]">
                    <img
                      src={resolveImageUrl(photo, 'dog')}
                      alt={`Evidencia ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, 'dog')}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] text-xs space-y-1.5">
              <p><strong>Descripción:</strong> {selectedReportDetail.description}</p>
              <p><strong>Dirección:</strong> {selectedReportDetail.addressDetails}</p>
              <p><strong>Informante:</strong> {selectedReportDetail.reporterName} (Tel: {formatPhone10(selectedReportDetail.reporterPhone)})</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-5 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#2C1E14] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN SEGURA (Sin window.confirm de navegador) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  {deleteTarget.type === 'pet' && '¿Eliminar animal en adopción?'}
                  {deleteTarget.type === 'event' && '¿Eliminar brigada de salud?'}
                  {deleteTarget.type === 'contact' && '¿Eliminar mensaje de contacto?'}
                  {deleteTarget.type === 'user' && '¿Eliminar usuario del sistema?'}
                  {deleteTarget.type === 'report' && '¿Eliminar reporte ciudadano?'}
                  {deleteTarget.type === 'story' && '¿Eliminar historia de rescate?'}
                  {deleteTarget.type === 'attendee' && '¿Anular inscripción a brigada?'}
                  {deleteTarget.type === 'application' && '¿Eliminar postulación de adopción?'}
                </h3>
                <p className="text-xs text-[#8A7568]">
                  Esta acción eliminará el registro de la plataforma de Purificación de forma definitiva.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] text-xs space-y-1">
              <p className="font-semibold text-[#2C1E14] text-sm">{deleteTarget.name}</p>
              {deleteTarget.detail && (
                <p className="text-[#6E574B] leading-relaxed">{deleteTarget.detail}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#5C4538] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APROBAR O RECHAZAR POSTULACIÓN Y ENVIAR NOTIFICACIÓN AL USUARIO */}
      {/* ========================================================================= */}
      {reviewAppModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#F5EDE2] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                  reviewAppModal.action === 'aprobada' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {reviewAppModal.action === 'aprobada' ? '🎉' : '⚠️'}
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                    {reviewAppModal.action === 'aprobada'
                      ? 'Aprobar Solicitud y Notificar al Usuario'
                      : 'Rechazar Solicitud y Notificar al Usuario'}
                  </h3>
                  <p className="text-xs text-[#8A7568]">
                    {reviewAppModal.app.applicantName} • Postula para {reviewAppModal.app.petName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewAppModal(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1 rounded-full hover:bg-[#FAF6F0] transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] text-xs space-y-1 text-[#6E574B]">
              <p>👤 <strong>Adoptante:</strong> {reviewAppModal.app.applicantName}</p>
              <p>📞 <strong>Teléfono de contacto:</strong> {formatPhone10(reviewAppModal.app.applicantPhone)}</p>
              <p>✉️ <strong>Correo electrónico:</strong> {reviewAppModal.app.applicantEmail}</p>
              <p>🐾 <strong>Mascota solicitada:</strong> {reviewAppModal.app.petName}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C1E14]">
                Mensaje personalizado que se enviará en la notificación al usuario:
              </label>
              <textarea
                value={reviewCustomNote}
                onChange={(e) => setReviewCustomNote(e.target.value)}
                rows={4}
                className="w-full text-xs p-3.5 rounded-2xl border border-[#E8DFD3] focus:ring-2 focus:ring-[#9E6B38] focus:outline-none bg-white text-[#2C1E14] leading-relaxed"
                placeholder="Escribe el mensaje u observaciones para el postulante..."
              />
              <p className="text-[11px] text-[#8A7568] flex items-center gap-1">
                <span>🔔 El postulante recibirá esta notificación directamente en su campana de avisos y en el sistema de Pata Amiga Purificación.</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setReviewAppModal(null)}
                className="px-4 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#5C4538] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  StoreController.updateApplicationStatus(
                    reviewAppModal.app.id,
                    reviewAppModal.action,
                    reviewCustomNote.trim() || undefined
                  );
                  refreshAllData();
                  showNotification(`Solicitud de ${reviewAppModal.app.applicantName} ${reviewAppModal.action.toUpperCase()} y notificación enviada con éxito.`);
                  setReviewAppModal(null);
                }}
                className={`px-5 py-2 text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                  reviewAppModal.action === 'aprobada'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <span>{reviewAppModal.action === 'aprobada' ? 'Confirmar Aprobación y Notificar' : 'Confirmar Rechazo y Notificar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURACIÓN Y DIAGNÓSTICO DE CORREO ELECTRÓNICO (GMAIL / SMTP) */}
      {/* ========================================================================= */}
      {showEmailConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-[#EAE2D5] shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#F5EDE2] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#9E6B38] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                    Configuración de Notificaciones por Correo Electrónico
                  </h3>
                  <p className="text-xs text-[#8A7568]">
                    Entrega de alertas para las 4 administradoras de Purificación, Tolima
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailConfigModal(false)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1 rounded-full hover:bg-[#FAF6F0] transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Gateway State Card */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              emailServerStatus?.configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                    emailServerStatus?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}></span>
                  <span className="font-bold text-sm">
                    {emailServerStatus?.configured
                      ? `Despacho Conectado: ${emailServerStatus.provider.toUpperCase()}`
                      : 'Servidor Listo • Requiere Contraseña de Aplicación Gmail'}
                  </span>
                </div>
                <button
                  onClick={fetchEmailStatus}
                  className="px-2.5 py-1 bg-white border border-black/10 rounded-full text-[11px] font-semibold text-[#5C4538] hover:bg-white/80 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#9E6B38]" />
                  <span>Revisar</span>
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-[#5C4538]">
                {emailServerStatus?.configured
                  ? `El servidor enviará los correos automáticamente a las 4 administradoras desde ${emailServerStatus.account}.`
                  : 'El servidor backend Express está activo y procesa cada postulación/reporte. Para que los correos salgan de la plataforma y lleguen a tu bandeja de entrada de Gmail sin intervención manual, añade la contraseña de aplicación de Gmail a las variables de entorno.'}
              </p>
            </div>

            {/* Admin Recipients List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#2C1E14] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9E6B38]" />
                <span>Bandejas de Administradoras Registradas ({StoreController.getAdminEmails().length}):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Danna Gasca', email: 'gascadanna414@gmail.com' },
                  { name: 'Sofia Lozano', email: 'sofiaaa.123791@gmail.com' },
                  { name: 'Adriana Macana', email: 'adrianamacana2@gmail.com' },
                  { name: 'Mari Masmela', email: 'marimasmela15@gmail.com' }
                ].map((adm, i) => (
                  <div key={i} className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2C1E14] text-[11px]">{adm.name}</p>
                      <p className="text-[10px] text-[#6E574B]">{adm.email}</p>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                      Receptor
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#2C1E14] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#9E6B38]" />
                <span>Cómo activar el envío automático a Gmail en 2 minutos:</span>
              </h4>
              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] text-xs space-y-2 text-[#5C4538] leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Ingresa a tu cuenta de Google en <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-[#9E6B38] font-bold underline">myaccount.google.com/security</a>.
                  </li>
                  <li>
                    Asegúrate de que la <strong>«Verificación en dos pasos»</strong> esté activada.
                  </li>
                  <li>
                    En la barra de búsqueda superior, escribe <strong>«Contraseñas de aplicaciones»</strong> (o App Passwords).
                  </li>
                  <li>
                    Crea una con el nombre <strong>«Pata Amiga»</strong>. Google te dará una clave de 16 caracteres (por ejemplo: <code>abcd efgh ijkl mnop</code>).
                  </li>
                  <li>
                    Agrega estas dos variables de entorno en el panel de configuración de la app:
                    <div className="mt-1.5 p-2 bg-[#2C1E14] text-[#FAF6F0] font-mono text-[11px] rounded-lg space-y-0.5">
                      <p>GMAIL_USER=gascadanna414@gmail.com</p>
                      <p>GMAIL_APP_PASSWORD=tu_clave_de_16_caracteres</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* Fallback Option */}
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Opción Inmediata Disponible Ahora:</span>
              </p>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Cada tarjeta del buzón cuenta con el botón <strong>«Abrir en Gmail (1 Clic)»</strong>. Al pulsarlo, se abre automáticamente la ventana de redacción de Gmail con el reporte o postulación dirigido a las 4 administradoras para que lo envíes de inmediato desde tu cuenta personal sin configuraciones previas.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={handleTestRealEmailDispatch}
                disabled={isTestingEmail}
                className="px-4 py-2 bg-[#9E6B38] hover:bg-[#855728] text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isTestingEmail ? 'Probando...' : 'Enviar Prueba al Correo Ahora'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailConfigModal(false)}
                className="px-5 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#5C4538] transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

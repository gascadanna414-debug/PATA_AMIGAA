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
  Check
} from 'lucide-react';
import { 
  User, 
  UserRole,
  HealthEvent, 
  AdoptionPet, 
  SuccessStory, 
  AnimalReport, 
  EventRegistration,
  AdoptionApplication
} from '../types';
import { AuthController } from '../controllers/authController';
import { StoreController } from '../controllers/storeController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { sanitizePhone10, isValidPhone10, formatPhone10 } from '../utils/phoneUtils';

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

  const [activeAdminTab, setActiveAdminTab] = useState<'reportes' | 'usuarios' | 'brigadas' | 'adopciones' | 'historias' | 'solicitudes'>('reportes');
  
  // Data states
  const [usersList, setUsersList] = useState<User[]>(() => AuthController.getAllUsers());
  const [reportsList, setReportsList] = useState<AnimalReport[]>(() => StoreController.getReports());
  const [eventsList, setEventsList] = useState<HealthEvent[]>(() => StoreController.getEvents());
  const [petsList, setPetsList] = useState<AdoptionPet[]>(() => StoreController.getAdoptionPets());
  const [storiesList, setStoriesList] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [appsList, setAppsList] = useState<AdoptionApplication[]>(() => StoreController.getAdoptionApplications());
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>(() => StoreController.getEventRegistrations());

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [speciesFilter, setSpeciesFilter] = useState<string>('todos');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('todos');

  // Modals & Form States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('voluntario');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [userModalError, setUserModalError] = useState<string | null>(null);

  const [editingPet, setEditingPet] = useState<Partial<AdoptionPet> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<HealthEvent> | null>(null);
  const [editingStory, setEditingStory] = useState<Partial<SuccessStory> | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<AnimalReport | null>(null);
  const [viewingRegistrationsEventId, setViewingRegistrationsEventId] = useState<string | null>(null);

  // Quick Login State for non-admins viewing the tab
  const [quickLoginEmail, setQuickLoginEmail] = useState('gascadanna414@gmail.com');
  const [quickLoginPass, setQuickLoginPass] = useState('123456');
  const [quickLoginError, setQuickLoginError] = useState<string | null>(null);

  // Success message banner
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
  };

  useEffect(() => {
    const handleDataChange = () => {
      refreshAllData();
    };
    window.addEventListener('pata-data-change', handleDataChange);
    window.addEventListener('auth-state-change', handleDataChange);
    return () => {
      window.removeEventListener('pata-data-change', handleDataChange);
      window.removeEventListener('auth-state-change', handleDataChange);
    };
  }, []);

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

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPhone.trim()) {
      setUserModalError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isValidPhone10(newUserPhone)) {
      setUserModalError('El número de teléfono debe tener exactamente 10 caracteres numéricos (ej: 3128904521).');
      return;
    }

    const res = AuthController.createUserByAdmin({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      password: newUserPassword
    });

    if (res.success) {
      setIsAddingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('123456');
      refreshAllData();
      showNotification(res.message);
    } else {
      setUserModalError(res.message);
    }
  };

  const handleToggleAdminRole = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const newRole = targetUser.role === 'admin' ? 'voluntario' : 'admin';
    AuthController.updateUserRole(userId, newRole);
    refreshAllData();
    showNotification(`Rol de ${targetUser.name} actualizado a ${newRole.toUpperCase()}`);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    AuthController.updateUserRole(userId, newRole);
    refreshAllData();
    showNotification(`Rol actualizado a ${newRole.toUpperCase()}`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      AuthController.deleteUser(userId);
      refreshAllData();
      showNotification(`Usuario ${userName} eliminado del sistema.`);
    }
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

  const handleDeleteReport = (reportId: string) => {
    if (confirm('¿Deseas eliminar este reporte?')) {
      StoreController.deleteReport(reportId);
      refreshAllData();
      setSelectedReportDetail(null);
      showNotification('Reporte eliminado con éxito.');
    }
  };

  // --- ACTIONS: EVENTS / BRIGADAS (Limit 25) ---
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent.date || !editingEvent.time || !editingEvent.locationName) {
      alert('Por favor completa todos los campos requeridos de la brigada.');
      return;
    }

    if (editingEvent.contactPhone && !isValidPhone10(editingEvent.contactPhone)) {
      alert('El teléfono de contacto de la brigada debe tener exactamente 10 caracteres (ej: 3128904521).');
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

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Seguro que deseas eliminar esta brigada de salud?')) {
      StoreController.deleteHealthEvent(eventId);
      refreshAllData();
      showNotification('Brigada eliminada del sistema.');
    }
  };

  const handleDeleteAttendee = (regId: string, attendeeName: string) => {
    if (confirm(`¿Deseas anular la inscripción de ${attendeeName} para liberar 1 cupo?`)) {
      StoreController.deleteEventRegistration(regId);
      refreshAllData();
      showNotification(`Inscripción de ${attendeeName} cancelada. Cupo liberado.`);
    }
  };

  // --- ACTIONS: ADOPTIONS (PETS) ---
  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet?.name || !editingPet.species || !editingPet.breed || !editingPet.story) {
      alert('Por favor completa los campos principales del animal en adopción.');
      return;
    }

    if (editingPet.rescuerContact && !isValidPhone10(editingPet.rescuerContact)) {
      alert('El teléfono de contacto del rescatista debe tener exactamente 10 dígitos (ej: 3128904521).');
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

  const handleDeletePet = (petId: string) => {
    if (confirm('¿Deseas eliminar este animal del catálogo de adopciones?')) {
      StoreController.deleteAdoptionPet(petId);
      refreshAllData();
      showNotification('Animal eliminado del catálogo de adopciones.');
    }
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
      alert('Por favor completa los campos de la historia de rescate.');
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

  const handleDeleteStory = (storyId: string) => {
    if (confirm('¿Deseas eliminar esta historia de rescate?')) {
      StoreController.deleteSuccessStory(storyId);
      refreshAllData();
      showNotification('Historia de rescate eliminada.');
    }
  };

  // Quick Demo Admin Login Action
  const handleAdminQuickLogin = () => {
    setQuickLoginError(null);
    const res = AuthController.login(quickLoginEmail, quickLoginPass);
    if (res.success) {
      refreshAllData();
    } else {
      setQuickLoginError(res.message);
    }
  };

  // If NOT ADMIN: Show friendly 1-click Admin Access Banner
  if (!currentUser || !isAdmin) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#9E6B38] mx-auto flex items-center justify-center border border-[#E8DFD3]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Acceso al Panel de Administración
            </h2>
            <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
              Este módulo permite administrar los usuarios registrados, modificar los animales en adopción, gestionar reportes ciudadanos y editar las brigadas de salud (límite 25 cupos) en Purificación, Tolima.
            </p>
          </div>

          {quickLoginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl text-left">
              {quickLoginError}
            </div>
          )}

          {/* 1-Click Fast Admin Access Button */}
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] space-y-3">
            <div className="text-xs text-[#5C4538] text-left space-y-1">
              <p className="font-bold text-[#2C1E14] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#9E6B38]" />
                Acceso Rápido Administrador (Danna Gascá)
              </p>
              <p className="text-[11px] text-[#8A7568]">
                Haz clic en el botón a continuación para autenticarte instantáneamente como Administradora Central:
              </p>
            </div>

            <button
              id="admin-quick-login-btn"
              onClick={handleAdminQuickLogin}
              className="w-full py-3 px-4 bg-[#2C1E14] hover:bg-[#3D2C1F] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#9E6B38]" />
              <span>Ingresar como Administrador (gascadanna414@gmail.com)</span>
            </button>
          </div>

          {currentUser && !isAdmin && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <p>Sesión activa actual: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
              <p>Rol: <strong className="uppercase">{currentUser.role}</strong>. Inicia como Administrador para acceder al panel.</p>
            </div>
          )}
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

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{usersList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Usuarios</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{petsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Adopciones</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{reportsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Reportes</span>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{eventsList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Brigadas</span>
          </div>
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
      <div className="flex flex-wrap items-center gap-2 bg-[#FAF6F0] p-1.5 rounded-full border border-[#E8DFD3]">
        {[
          { id: 'reportes', label: `Reportes Ciudadanos (${reportsList.length})`, icon: AlertCircle },
          { id: 'usuarios', label: `Personas Registradas (${usersList.length})`, icon: Users },
          { id: 'adopciones', label: `Animales en Adopción (${petsList.length})`, icon: Heart },
          { id: 'brigadas', label: `Modificar Brigadas (${eventsList.length})`, icon: Calendar },
          { id: 'solicitudes', label: `Solicitudes Adopción (${appsList.length})`, icon: UserCheck },
          { id: 'historias', label: `Historias Rescate (${storiesList.length})`, icon: BookOpen }
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
              className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#9E6B38] text-white shadow-xs'
                  : 'text-[#6E574B] hover:text-[#2C1E14] hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

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
                        onClick={() => handleDeleteReport(report.id)}
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
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] text-[#6E574B] uppercase tracking-wider font-bold border-b border-[#E8DFD3]">
                  <tr>
                    <th className="px-4 py-3">Nombre Completo</th>
                    <th className="px-4 py-3">Correo Electrónico</th>
                    <th className="px-4 py-3">Teléfono (10 Dígitos)</th>
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
                      const cleanPhone = user.phone ? sanitizePhone10(user.phone) : '';

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
                                  {formatPhone10(user.phone)}
                                </span>
                                <a
                                  href={`https://wa.me/57${cleanPhone}`}
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
                        onClick={() => handleDeletePet(pet.id)}
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
                      <span className="text-xs font-bold text-[#9E6B38] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#E8DFD3]">
                        {event.registeredCount}/25 cupos ({spotsLeft} libres)
                      </span>
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
                        onClick={() => handleDeleteEvent(event.id)}
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
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => {
                        StoreController.updateApplicationStatus(app.id, 'aprobada');
                        refreshAllData();
                        showNotification(`Solicitud de ${app.applicantName} APROBADA con éxito.`);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full cursor-pointer"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        StoreController.updateApplicationStatus(app.id, 'rechazada');
                        refreshAllData();
                        showNotification(`Solicitud de ${app.applicantName} rechazada.`);
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full cursor-pointer"
                    >
                      Rechazar
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
                      onClick={() => handleDeleteStory(story.id)}
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
                  Teléfono / Celular * <span className="text-[10px] text-[#8A7568] font-normal">(Exactamente 10 dígitos)</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(sanitizePhone10(e.target.value))}
                  placeholder="3128904521"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
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
                  <label className="block font-semibold text-[#2C1E14] mb-1">Contraseña Inicial</label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={13}
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="123456"
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
                    <option value="Otro">🐾 Otro</option>
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
                          onClick={() => handleDeleteAttendee(reg.id, reg.ownerName)}
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
    </div>
  );
};

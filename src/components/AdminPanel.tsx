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
  Save, 
  Search, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Camera, 
  Bell, 
  UserCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  User, 
  HealthEvent, 
  AdoptionPet, 
  SuccessStory, 
  AnimalReport, 
  EventRegistration,
  AdoptionApplication,
  AppNotification
} from '../types';
import { AuthController } from '../controllers/authController';
import { StoreController } from '../controllers/storeController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
import { resolveImageUrl } from '../utils/imageUtils';

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

  const [activeAdminTab, setActiveAdminTab] = useState<'usuarios' | 'reportes' | 'brigadas' | 'adopciones' | 'historias' | 'solicitudes'>('reportes');
  
  // Data states
  const [usersList, setUsersList] = useState<User[]>(() => AuthController.getAllUsers());
  const [reportsList, setReportsList] = useState<AnimalReport[]>(() => StoreController.getReports());
  const [eventsList, setEventsList] = useState<HealthEvent[]>(() => StoreController.getEvents());
  const [petsList, setPetsList] = useState<AdoptionPet[]>(() => StoreController.getAdoptionPets());
  const [storiesList, setStoriesList] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [appsList, setAppsList] = useState<AdoptionApplication[]>(() => StoreController.getAdoptionApplications());
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>(() => StoreController.getEventRegistrations());

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Form States
  const [editingPet, setEditingPet] = useState<Partial<AdoptionPet> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<HealthEvent> | null>(null);
  const [editingStory, setEditingStory] = useState<Partial<SuccessStory> | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<AnimalReport | null>(null);
  const [viewingRegistrationsEventId, setViewingRegistrationsEventId] = useState<string | null>(null);

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

  // --- ACTIONS: USER MANAGEMENT ---
  const handleToggleAdminRole = (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const newRole = targetUser.role === 'admin' ? 'voluntario' : 'admin';
    AuthController.updateUserRole(userId, newRole);
    refreshAllData();
    showNotification(`Rol de ${targetUser.name} actualizado a ${newRole.toUpperCase()}`);
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
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    StoreController.saveHealthEvent({
      ...editingEvent,
      title: editingEvent.title!,
      date: editingEvent.date!,
      time: editingEvent.time!,
      locationName: editingEvent.locationName!,
      address: editingEvent.address || 'Purificación, Tolima',
      totalSpots: 25
    });

    setEditingEvent(null);
    refreshAllData();
    showNotification('Brigada de salud guardada exitosamente con límite de 25 cupos.');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Seguro que deseas eliminar esta brigada?')) {
      StoreController.deleteHealthEvent(eventId);
      refreshAllData();
      showNotification('Brigada eliminada.');
    }
  };

  // --- ACTIONS: ADOPTIONS (PETS) ---
  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet?.name || !editingPet.species || !editingPet.breed || !editingPet.story) {
      alert('Por favor completa los campos del animal en adopción.');
      return;
    }

    StoreController.saveAdoptionPet({
      ...editingPet,
      name: editingPet.name!,
      species: editingPet.species as any,
      breed: editingPet.breed!,
      story: editingPet.story!
    });

    setEditingPet(null);
    refreshAllData();
    showNotification('Ficha de adopción guardada con éxito.');
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('¿Deseas eliminar este animal de adopciones?')) {
      StoreController.deleteAdoptionPet(petId);
      refreshAllData();
      showNotification('Animal eliminado del catálogo de adopciones.');
    }
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

  // If NOT ADMIN: Show access restricted message
  if (!currentUser || !isAdmin) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center border border-red-200">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
            Acceso Restringido para Administradores
          </h2>
          <p className="text-sm text-[#6E574B] leading-relaxed">
            Solo los administradores autorizados de Pata Amiga Purificación tienen permisos para editar la información de brigadas, adopciones, historias de rescate y ver la lista de usuarios registrados.
          </p>
        </div>

        {!currentUser ? (
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] cursor-pointer"
          >
            Iniciar sesión como Administrador
          </button>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-[#EAE2D5] text-xs text-[#5C4538] space-y-2">
            <p>Sesión activa como: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <p>Rol actual: <span className="uppercase font-bold text-[#9E6B38]">{currentUser.role}</span></p>
            <p className="text-[11px] text-[#8A7568]">
              Si eres coordinador y requieres permisos de administración, contacta al equipo central de Purificación Tolima.
            </p>
          </div>
        )}
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
              Panel de Administración Central
            </span>
            <span className="text-[11px] text-[#D8C7BA]">
              • Purificación, Tolima
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-white tracking-tight">
            Gestión y Control de Pata Amiga
          </h1>
          <p className="text-xs sm:text-sm text-[#D8C7BA]">
            Bienvenido <strong>{currentUser.name}</strong>. Administra reportes directos, brigadas (límite 25 cupos), animales en adopción, historias de rescate y usuarios registrados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 px-3 py-2 rounded-2xl text-xs border border-white/10 text-center">
            <span className="block font-bold text-[#FAF6F0]">{usersList.length}</span>
            <span className="text-[10px] text-[#D8C7BA]">Usuarios</span>
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#FAF6F0] p-1.5 rounded-full border border-[#E8DFD3]">
        {[
          { id: 'reportes', label: `Reportes Ciudadanos (${reportsList.length})`, icon: AlertCircle },
          { id: 'usuarios', label: `Usuarios Registrados (${usersList.length})`, icon: Users },
          { id: 'brigadas', label: `Brigadas de Salud (${eventsList.length})`, icon: Calendar },
          { id: 'adopciones', label: `Adopciones (${petsList.length})`, icon: Heart },
          { id: 'historias', label: `Historias de Rescate (${storiesList.length})`, icon: BookOpen },
          { id: 'solicitudes', label: `Solicitudes de Adopción (${appsList.length})`, icon: UserCheck }
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

      {/* TAB 1: REPORTES CIUDADANOS */}
      {activeAdminTab === 'reportes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Reportes de Rescate Recibidos
              </h2>
              <p className="text-xs text-[#6E574B]">
                Todos los reportes enviados por ciudadanos con sus fotos de evidencia llegan aquí.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8A7568] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por barrio o animal..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsList
              .filter(r => 
                !searchQuery || 
                r.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.reporterName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(report => {
                const photos = report.photos && report.photos.length > 0 ? report.photos : [report.photoUrl];
                return (
                  <div 
                    key={report.id}
                    className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs hover:border-[#9E6B38] transition flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      {/* Image & Badges */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#2C1E14]">
                        <img
                          src={resolveImageUrl(report.photoUrl)}
                          alt={report.animalType}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                          report.urgency === 'urgente' ? 'bg-red-600' : 'bg-amber-600'
                        }`}>
                          {report.urgency.toUpperCase()}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                          📷 {photos.length} foto(s)
                        </span>
                      </div>

                      {/* Header Info */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#8A7568] mb-1">
                          <span>Cod: {report.id}</span>
                          <span>{report.reportedAt}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#2C1E14]">
                          {report.animalType} en {report.neighborhood}
                        </h3>
                        <p className="text-xs text-[#6E574B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#9E6B38]" />
                          <span className="truncate">{report.addressDetails}</span>
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#5C4538] line-clamp-2 bg-[#FAF6F0] p-2 rounded-xl border border-[#E8DFD3]">
                        {report.description}
                      </p>

                      {/* Reporter */}
                      <div className="text-[11px] text-[#6E574B] border-t border-[#F5EDE2] pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Reportado por:</span>
                          <span className="font-semibold text-[#2C1E14]">{report.reporterName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Teléfono:</span>
                          <a href={`tel:${report.reporterPhone}`} className="text-[#9E6B38] font-bold hover:underline">
                            {report.reporterPhone}
                          </a>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-[#6E574B] uppercase mb-1">
                          Cambiar Estado de Atención:
                        </label>
                        <select
                          value={report.status}
                          onChange={(e) => handleUpdateReportStatus(report.id, e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        >
                          <option value="recibido">1. Recibido por Admin</option>
                          <option value="en_camino">2. Rescatista en camino</option>
                          <option value="en_atencion">3. En atención veterinaria</option>
                          <option value="rescatado">4. Rescatado y a salvo</option>
                        </select>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
                      <button
                        onClick={() => setSelectedReportDetail(report)}
                        className="text-xs font-semibold text-[#9E6B38] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver todas las fotos</span>
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

      {/* TAB 2: LISTA DE USUARIOS REGISTRADOS */}
      {activeAdminTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Lista de Usuarios Registrados ({usersList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Registro oficial de ciudadanos, rescatistas, voluntarios y administradores de la plataforma.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8A7568] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] text-[#6E574B] uppercase tracking-wider font-bold border-b border-[#E8DFD3]">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Correo Electrónico</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Rol en la Red</th>
                    <th className="px-4 py-3">Fecha Registro</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EDE2]">
                  {usersList
                    .filter(u => 
                      !searchQuery || 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.role.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(user => (
                      <tr key={user.id} className="hover:bg-[#FAF6F0]/60 transition">
                        <td className="px-4 py-3.5 font-bold text-[#2C1E14] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-[#5C4538] font-mono">
                          {user.email}
                        </td>
                        <td className="px-4 py-3.5 text-[#5C4538]">
                          {user.phone || 'No registrado'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            user.role === 'admin'
                              ? 'bg-[#2C1E14] text-[#FAF6F0]'
                              : user.role === 'rescatista'
                              ? 'bg-amber-100 text-amber-900'
                              : user.role === 'voluntario'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-100 text-stone-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#8A7568]">
                          {user.registeredAt || 'Reciente'}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleAdminRole(user.id)}
                            className="px-2.5 py-1 bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] rounded-lg text-[11px] font-semibold text-[#9E6B38] cursor-pointer"
                            title="Alternar rol administrador"
                          >
                            {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRIGADAS DE SALUD (Limit 25) */}
      {activeAdminTab === 'brigadas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Brigadas y Jornadas Comunitarias (Límite: 25 cupos)
              </h2>
              <p className="text-xs text-[#6E574B]">
                Solo administradores pueden crear o editar brigadas de esterilización y vacunación en Purificación.
              </p>
            </div>
            <button
              onClick={() => setEditingEvent({
                title: '',
                date: 'Próximo Sábado',
                time: '08:00 AM - 02:00 PM',
                locationName: 'Polideportivo Municipal',
                address: 'Purificación, Tolima',
                type: 'esterilizacion',
                isFree: true,
                totalSpots: 25,
                description: 'Jornada comunitaria con cupo máximo de 25 personas.'
              })}
              className="px-4 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Brigada</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsList.map(event => {
              const spotsLeft = 25 - (event.registeredCount || 0);
              const eventRegs = registrationsList.filter(r => r.eventId === event.id);

              return (
                <div 
                  key={event.id}
                  className="bg-white rounded-2xl border border-[#EAE2D5] p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2C1E14] text-white">
                        {event.type}
                      </span>
                      <span className="text-xs font-bold text-[#9E6B38] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#E8DFD3]">
                        {event.registeredCount}/25 cupos ({spotsLeft} libres)
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                      {event.title}
                    </h3>

                    <div className="text-xs text-[#6E574B] space-y-1 bg-[#FAF6F0] p-3 rounded-xl border border-[#E8DFD3]">
                      <p><strong>Fecha:</strong> {event.date}</p>
                      <p><strong>Horario:</strong> {event.time}</p>
                      <p><strong>Lugar:</strong> {event.locationName} ({event.address})</p>
                    </div>

                    <p className="text-xs text-[#5C4538] leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="border-t border-[#F5EDE2] pt-3 flex items-center justify-between">
                    <button
                      onClick={() => setViewingRegistrationsEventId(event.id)}
                      className="text-xs font-semibold text-[#9E6B38] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Ver inscritos ({eventRegs.length})</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-1.5 text-[#5C4538] hover:bg-[#FAF6F0] rounded-lg border border-[#E8DFD3] cursor-pointer"
                        title="Editar brigada"
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

      {/* TAB 4: ADOPCIONES */}
      {activeAdminTab === 'adopciones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Gestión de Animales en Adopción ({petsList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Solo los administradores pueden añadir, modificar o retirar fichas de animales.
              </p>
            </div>
            <button
              onClick={() => setEditingPet({
                name: '',
                species: 'Perro',
                breed: 'Criollo Tolimense',
                gender: 'Macho',
                age: '1 año',
                size: 'Mediano',
                story: 'Rescatado en Purificación, Tolima. Listo para encontrar un hogar responsable.',
                photos: ['/images/mateo_rescue_story_1788226480262.jpg'],
                status: 'disponible'
              })}
              className="px-4 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nuevo Animal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {petsList.map(pet => (
              <div 
                key={pet.id}
                className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-3 space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1E14]">
                    <img
                      src={resolveImageUrl(pet.photos[0])}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">
                      {pet.species} • {pet.age}
                    </span>
                    <span className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                      pet.status === 'disponible' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {pet.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#2C1E14]">
                    {pet.name} ({pet.breed})
                  </h3>
                  <p className="text-xs text-[#5C4538] line-clamp-2">
                    {pet.story}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A7568]">
                    {pet.rescuerLocation || 'Purificación'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPet(pet)}
                      className="p-1 text-[#5C4538] hover:bg-white rounded border border-[#E8DFD3] cursor-pointer"
                      title="Editar ficha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
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

      {/* TAB 5: HISTORIAS DE RESCATE */}
      {activeAdminTab === 'historias' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <div>
              <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Historias de Transformación y Rescate ({storiesList.length})
              </h2>
              <p className="text-xs text-[#6E574B]">
                Edita las historias de antes y después de los animales recuperados en Purificación.
              </p>
            </div>
            <button
              onClick={() => setEditingStory({
                petName: '',
                species: 'Perro',
                breed: 'Criollo',
                estimatedAge: '1 año',
                rescueLocation: 'Purificación, Tolima',
                rescueStory: 'Fue encontrado en estado de abandono en Purificación.',
                adoptionStory: 'Hoy vive feliz con una familia adoptante en el Tolima.',
                healthBefore: 'Desnutrido y herido',
                healthAfter: 'Totalmente recuperado',
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
                        src={resolveImageUrl(story.beforePhotoUrl)}
                        alt={`Antes ${story.petName}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-white">
                        Antes
                      </span>
                    </div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1E14]">
                      <img
                        src={resolveImageUrl(story.currentPhotoUrl)}
                        alt={`Después ${story.petName}`}
                        className="w-full h-full object-cover"
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

      {/* TAB 6: SOLICITUDES DE ADOPCIÓN */}
      {activeAdminTab === 'solicitudes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D5]">
            <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Postulaciones de Adopción ({appsList.length})
            </h2>
            <p className="text-xs text-[#6E574B]">
              Revisa los postulantes para cada animal y aprueba o rechaza solicitudes.
            </p>
          </div>

          <div className="space-y-3">
            {appsList.length === 0 ? (
              <p className="text-xs text-[#8A7568] text-center py-8">
                No hay solicitudes de adopción pendientes por el momento.
              </p>
            ) : (
              appsList.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-2xl border border-[#EAE2D5] shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2C1E14]">{app.applicantName}</span>
                      <span className="text-xs text-[#9E6B38] font-semibold">para adoptar a {app.petName}</span>
                    </div>
                    <p className="text-xs text-[#6E574B]">
                      📞 {app.applicantPhone} • ✉️ {app.applicantEmail} • 📍 {app.applicantCity}
                    </p>
                    <p className="text-xs text-[#5C4538] italic">"{app.motivation}"</p>
                    <span className="text-[10px] text-[#8A7568] block">Fecha: {app.submittedAt}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        StoreController.updateApplicationStatus(app.id, 'aprobada');
                        refreshAllData();
                        showNotification(`Solicitud de ${app.applicantName} APROBADA`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full cursor-pointer"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        StoreController.updateApplicationStatus(app.id, 'rechazada');
                        refreshAllData();
                        showNotification(`Solicitud de ${app.applicantName} rechazada`);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full cursor-pointer"
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

      {/* MODAL: REPORT DETAIL & ALL PHOTOS */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <div>
                <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Detalles del Reporte #{selectedReportDetail.id}
                </h3>
                <p className="text-xs text-[#6E574B]">
                  {selectedReportDetail.animalType} — {selectedReportDetail.neighborhood}
                </p>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1 rounded-full hover:bg-[#FAF6F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery */}
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
                      src={resolveImageUrl(photo)}
                      alt={`Evidencia ${i + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] text-xs space-y-1.5">
              <p><strong>Descripción:</strong> {selectedReportDetail.description}</p>
              <p><strong>Dirección:</strong> {selectedReportDetail.addressDetails}</p>
              <p><strong>Contacto Reportero:</strong> {selectedReportDetail.reporterName} ({selectedReportDetail.reporterPhone})</p>
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

      {/* MODAL: EDIT/CREATE BRIGADA */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEvent} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                {editingEvent.id ? 'Editar Brigada de Salud' : 'Crear Nueva Brigada'}
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
                  placeholder="Ej. Jornada de Esterilización Barrio Camilo Torres"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Fecha *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="Ej. Sábado 14 de Octubre"
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
                  placeholder="Ej. Polideportivo Municipal"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Detalles del evento..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-[11px] text-[#6E574B]">
                ℹ️ Capacidad fija: <strong>25 personas máximo por evento</strong> según directiva oficial.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
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

      {/* MODAL: EDIT/CREATE PET */}
      {editingPet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSavePet} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                {editingPet.id ? `Editar Ficha de ${editingPet.name}` : 'Publicar Animal para Adopción'}
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
                  <label className="block font-semibold text-[#2C1E14] mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={editingPet.name || ''}
                    onChange={e => setEditingPet({ ...editingPet, name: e.target.value })}
                    placeholder="Ej. Mateo"
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
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
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
                    placeholder="Ej. Criollo"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Edad</label>
                  <input
                    type="text"
                    value={editingPet.age || ''}
                    onChange={e => setEditingPet({ ...editingPet, age: e.target.value })}
                    placeholder="Ej. 1 año"
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

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Historia / Descripción *</label>
                <textarea
                  rows={3}
                  required
                  value={editingPet.story || ''}
                  onChange={e => setEditingPet({ ...editingPet, story: e.target.value })}
                  placeholder="Cuenta la historia del rescate y personalidad..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Estado de Adopción</label>
                <select
                  value={editingPet.status || 'disponible'}
                  onChange={e => setEditingPet({ ...editingPet, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_proceso">En Proceso de Adopción</option>
                  <option value="adoptado">Adoptado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
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
                Guardar Ficha
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT/CREATE STORY */}
      {editingStory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveStory} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                {editingStory.id ? `Editar Historia de ${editingStory.petName}` : 'Publicar Nueva Historia de Rescate'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Nombre del Animal *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.petName || ''}
                    onChange={e => setEditingStory({ ...editingStory, petName: e.target.value })}
                    placeholder="Ej. Hades"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2C1E14] mb-1">Raza / Tipo *</label>
                  <input
                    type="text"
                    required
                    value={editingStory.breed || ''}
                    onChange={e => setEditingStory({ ...editingStory, breed: e.target.value })}
                    placeholder="Ej. Criollo rescatado"
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Historia del Rescate *</label>
                <textarea
                  rows={2}
                  required
                  value={editingStory.rescueStory || ''}
                  onChange={e => setEditingStory({ ...editingStory, rescueStory: e.target.value })}
                  placeholder="Cómo se encontró al animal en Purificación..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C1E14] mb-1">Historia de Adopción y Transformación *</label>
                <textarea
                  rows={2}
                  required
                  value={editingStory.adoptionStory || ''}
                  onChange={e => setEditingStory({ ...editingStory, adoptionStory: e.target.value })}
                  placeholder="Cómo vive ahora en su nuevo hogar..."
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-[#2C1E14]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="px-4 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs font-semibold text-[#2C1E14]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold shadow-xs"
              >
                Guardar Historia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: VIEW EVENT REGISTRATIONS (25 spots) */}
      {viewingRegistrationsEventId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE2D5] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14]">
                Inscritos en la Brigada (Máx. 25 cupos)
              </h3>
              <button
                onClick={() => setViewingRegistrationsEventId(null)}
                className="text-[#8A7568] hover:text-[#2C1E14] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {registrationsList.filter(r => r.eventId === viewingRegistrationsEventId).length === 0 ? (
                <p className="text-xs text-[#8A7568] text-center py-6">
                  Aún no hay ciudadanos inscritos en esta brigada.
                </p>
              ) : (
                registrationsList
                  .filter(r => r.eventId === viewingRegistrationsEventId)
                  .map((reg, idx) => (
                    <div key={reg.id} className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#2C1E14]">#{idx + 1}. {reg.ownerName}</span>
                        <p className="text-[11px] text-[#6E574B]">
                          Mascota: <strong>{reg.petName}</strong> ({reg.petSpecies}) • Tel: {reg.ownerPhone}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E8DFD3] text-[#9E6B38] font-bold">
                        {reg.confirmationCode}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingRegistrationsEventId(null)}
                className="px-5 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold"
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

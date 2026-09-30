'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { StaffUser } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  Lock,
  Edit2,
  UserCheck,
} from 'lucide-react';

const MODULES_LIST = [
  { id: 'panel', label: 'Panel general', desc: 'KPIs consolidados y métricas' },
  { id: 'pos', label: 'Punto de venta (POS)', desc: 'Facturación rápida y cobro mixto' },
  { id: 'caja', label: 'Caja y arqueos', desc: 'Aperturas, movimientos y cierre' },
  { id: 'inventario', label: 'Inventario y catálogo', desc: 'Existencias y ficha de productos' },
  { id: 'compras', label: 'Compras y recepción', desc: 'Órdenes de compra y recepción' },
  { id: 'facturacion', label: 'Facturación fiscal', desc: 'Historial y notas de crédito' },
  { id: 'personal', label: 'Personal y roles', desc: 'Gestión de usuarios y accesos' },
  { id: 'reportes', label: 'Reportes y análisis', desc: 'Estadísticas ejecutivas' },
];

export default function PersonalPage() {
  const { staffList, currentUser, setCurrentUser } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const [selectedRoleGroup, setSelectedRoleGroup] = useState('Todos');
  const [selectedEmployee, setSelectedEmployee] = useState<StaffUser>(staffList[0]);
  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // New staff form state
  const [newNombre, setNewNombre] = useState('');
  const [newCedula, setNewCedula] = useState('');
  const [newCargo, setNewCargo] = useState('Cajero');
  const [newSucursal, setNewSucursal] = useState('Managua Centro');
  const [newGrupo, setNewGrupo] = useState<'Administrador' | 'Cajero' | 'Bodeguero'>('Cajero');

  const filteredStaff = staffList.filter((emp) => {
    const matchesSearch =
      emp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.usuario.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedBranch !== 'Todas' && emp.sucursal !== selectedBranch && emp.sucursal !== 'Todas') {
      return false;
    }
    if (selectedRoleGroup !== 'Todos' && emp.grupo !== selectedRoleGroup) {
      return false;
    }

    return true;
  });

  const getModulePermission = (userGroup: string, moduleId: string): boolean => {
    if (userGroup === 'Administrador') return true;
    if (userGroup === 'Cajero') {
      return moduleId === 'pos' || moduleId === 'caja' || moduleId === 'facturacion';
    }
    if (userGroup === 'Bodeguero') {
      return moduleId === 'inventario' || moduleId === 'compras';
    }
    return false;
  };

  const handleSavePermissions = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Header
        title="Personal y roles"
        subtitle="Directorio de colaboradores, asignación de permisos y control laboral"
        badges={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6A1A] text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            {staffList.filter((s) => s.estado === 'Activo').length} empleados activos · 3 sucursales
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => setShowNewStaffModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Nuevo empleado
          </button>
        }
      />

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Staff Directory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, cargo, cédula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-medium text-[#1E293B] bg-slate-50/50"
                />
              </div>

              <div className="sm:col-span-5">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
                >
                  <option value="Todas">Todas las sucursales</option>
                  <option value="Managua Centro">Managua Centro</option>
                  <option value="Ciudad Sandino">Ciudad Sandino</option>
                  <option value="Sabana Grande">Sabana Grande</option>
                </select>
              </div>
            </div>

            {/* Role filter pills */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#F3ECE6] overflow-x-auto no-scrollbar">
              {['Todos', 'Administrador', 'Cajero', 'Bodeguero'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedRoleGroup(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedRoleGroup === grp
                      ? 'bg-[#1E293B] text-white'
                      : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-3xl border border-[#F3ECE6] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#F3ECE6] text-[#64748B] font-bold">
                    <th className="py-3.5 px-6">Empleado</th>
                    <th className="py-3.5 px-4">Cédula</th>
                    <th className="py-3.5 px-4">Sucursal</th>
                    <th className="py-3.5 px-4">Grupo de rol</th>
                    <th className="py-3.5 px-6 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECE6]">
                  {filteredStaff.map((emp) => {
                    const isSelected = selectedEmployee.id === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF8F4] border-l-4 border-l-[#FF6A1A]'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {emp.avatar}
                            </div>
                            <div>
                              <p className="font-bold text-[#1E293B]">{emp.nombre}</p>
                              <p className="text-[11px] text-[#64748B]">{emp.cargo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                          {emp.cedula}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] font-medium">
                          {emp.sucursal}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold ${
                              emp.grupo === 'Administrador'
                                ? 'bg-orange-50 text-[#FF6A1A] border border-orange-200'
                                : emp.grupo === 'Cajero'
                                ? 'bg-emerald-50 text-[#1E9E60] border border-emerald-200'
                                : emp.grupo === 'Bodeguero'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-[#64748B]'
                            }`}
                          >
                            {emp.grupo}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Badge variant={emp.estado === 'Activo' ? 'success' : 'neutral'}>
                            {emp.estado}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Employee Profile & Permissions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Ficha del empleado */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6A1A] to-[#FF8C38] text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {selectedEmployee.avatar}
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1E293B]">
                    {selectedEmployee.nombre}
                  </h2>
                  <p className="text-xs text-[#64748B] font-semibold">
                    {selectedEmployee.cargo} · {selectedEmployee.sucursal}
                  </p>
                  <p className="font-mono text-[11px] text-[#94A3B8] mt-0.5">
                    Usuario: {selectedEmployee.usuario}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Editar ficha personal de ${selectedEmployee.nombre}`)}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                title="Editar empleado"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[#F3ECE6]">
              <div className="space-y-1">
                <span className="text-[#94A3B8] font-bold block text-[10px] uppercase">
                  Teléfono
                </span>
                <span className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#94A3B8]" />
                  {selectedEmployee.telefono}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[#94A3B8] font-bold block text-[10px] uppercase">
                  Fecha ingreso
                </span>
                <span className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#94A3B8]" />
                  {selectedEmployee.fechaIngreso}
                </span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[#94A3B8] font-bold block text-[10px] uppercase">
                  Correo institucional
                </span>
                <span className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#94A3B8]" />
                  {selectedEmployee.correo}
                </span>
              </div>
            </div>

            {/* Compensation snippet */}
            <div className="p-3.5 rounded-2xl bg-[#FFF4EC] border border-[#FFE0CC] flex justify-between items-center text-xs">
              <div>
                <span className="text-[#B24100] font-bold block text-[10px] uppercase">
                  Salario base mensual
                </span>
                <span className="text-sm font-black text-[#FF6A1A]">
                  {formatCurrency(selectedEmployee.salarioBase)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#B24100] font-bold block text-[10px] uppercase">
                  Bonos vigentes
                </span>
                <span className="text-xs font-extrabold text-[#1E293B]">
                  +{formatCurrency(selectedEmployee.bonosVigentes)}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Grupos y permisos asignados */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                  Permisos del rol: {selectedEmployee.grupo}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Módulos autorizados para este colaborador
                </p>
              </div>
              <Shield className="w-5 h-5 text-[#FF6A1A]" />
            </div>

            {saveFeedback && (
              <div className="flex items-center gap-2 p-3 bg-[#E8F8F0] border border-[#B6EAD0] rounded-xl text-[#1E9E60] text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Matriz de permisos actualizada correctamente.
              </div>
            )}

            {/* Permissions checklist */}
            <div className="space-y-2 text-xs">
              {MODULES_LIST.map((mod) => {
                const isAllowed = getModulePermission(selectedEmployee.grupo, mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                      isAllowed
                        ? 'border-[#B6EAD0] bg-[#FAFDFB]'
                        : 'border-[#E2E8F0] bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#1E293B]">{mod.label}</p>
                      <p className="text-[11px] text-[#64748B]">{mod.desc}</p>
                    </div>

                    <div className="shrink-0">
                      {isAllowed ? (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#1E9E60] bg-[#E8F8F0] px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3 h-3" />
                          Permitido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#94A3B8] bg-slate-200/60 px-2 py-1 rounded-xl">
                          <Lock className="w-3 h-3" />
                          Restringido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSavePermissions}
              className="w-full py-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Guardar configuración de permisos
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Nuevo empleado */}
      {showNewStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#F3ECE6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#1E293B]">Registrar nuevo empleado</h3>
            <p className="text-xs text-[#64748B]">
              Crea un perfil de personal para autorizar accesos al punto de venta y bodegas.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Empleado ${newNombre} registrado con rol ${newGrupo}.`);
                setShowNewStaffModal(false);
              }}
              className="space-y-3.5 pt-2 text-xs"
            >
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Nombre y apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Gómez"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Cédula</label>
                  <input
                    type="text"
                    required
                    placeholder="001-XXXXXX-XXXXX"
                    value={newCedula}
                    onChange={(e) => setNewCedula(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-mono text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Cargo</label>
                  <input
                    type="text"
                    required
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Sucursal asignada</label>
                  <select
                    value={newSucursal}
                    onChange={(e) => setNewSucursal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="Managua Centro">Managua Centro</option>
                    <option value="Ciudad Sandino">Ciudad Sandino</option>
                    <option value="Sabana Grande">Sabana Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Grupo de permisos</label>
                  <select
                    value={newGrupo}
                    onChange={(e) => setNewGrupo(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="Cajero">Cajero (Ventas y caja)</option>
                    <option value="Bodeguero">Bodeguero (Inventario y compras)</option>
                    <option value="Administrador">Administrador (Total)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewStaffModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] text-white font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                >
                  Registrar empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

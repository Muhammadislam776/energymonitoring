import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Shield,
  Building,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Lock,
} from 'lucide-react';

export const UsersTenantsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('facility_manager');
  const [organization, setOrganization] = useState('Metropolis Facilities');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await api.getUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        name,
        email,
        password,
        role,
        organization_name: organization,
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error creating user');
    }
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    facility_manager: 'Facility Manager',
    energy_manager: 'Energy Manager',
    tenant: 'Tenant User',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Access Control & Multitenancy
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Users & Tenant Isolation Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based authorization (RBAC) and strict tenant data isolation boundaries
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Tenant Organization</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        u.role === 'super_admin'
                          ? 'blue'
                          : u.role === 'energy_manager'
                          ? 'healthy'
                          : u.role === 'facility_manager'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {roleLabels[u.role] || u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {u.tenant_name || u.organization_name || 'Global Enterprise'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Provision New Operator or Tenant"
          subtitle="Configure credentials and security access level"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@apextech.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                <option value="facility_manager">Facility Manager (Assets & Floors)</option>
                <option value="energy_manager">Energy Manager (Telemetry & AI)</option>
                <option value="tenant">Tenant (Strict Space Isolation)</option>
                <option value="super_admin">Super Admin (Full Governance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

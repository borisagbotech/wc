'use client';

import { useState } from 'react';
import { FiUsers, FiPlus, FiSearch, FiUser, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';
import UserForm from './UserForm';

// Données factices pour la démo
const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'admin',
    company: 'Toutes',
    status: 'active',
    phone: '+33 6 12 34 56 78',
    lastLogin: '2025-09-30T14:30:00',
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@company.fr',
    role: 'manager',
    company: 'Entreprise A',
    status: 'active',
    phone: '+33 6 98 76 54 32',
    lastLogin: '2025-09-29T10:15:00',
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre.durand@company.fr',
    role: 'operator',
    company: 'Entreprise B',
    status: 'inactive',
    phone: '+33 6 45 67 89 01',
    lastLogin: '2025-09-25T16:45:00',
  },
];

const UserTable = ({ users, onEdit, onDelete, onStatusToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
      manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800' },
      operator: { label: 'Opérateur', color: 'bg-green-100 text-green-800' }
    };
    const roleInfo = roles[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="operator">Opérateur</option>
            </select>
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FiUser className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Modifier"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUsers.length}</span> sur{' '}
          <span className="font-medium">{users.length}</span> utilisateurs
        </div>
        <nav className="flex space-x-2" aria-label="Pagination">
          <button
            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled
          >
            Précédent
          </button>
          <button
            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={filteredUsers.length <= 10}
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>
  );
};

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSaveUser = (userData) => {
    if (currentUser) {
      // Mise à jour d'un utilisateur existant
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...userData } : user
      ));
    } else {
      // Création d'un nouvel utilisateur
      const newUser = {
        ...userData,
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        lastLogin: null
      };
      setUsers([...users, newUser]);
    }
    setIsFormOpen(false);
  };

  const handleStatusToggle = (userId, status) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les utilisateurs, leurs rôles et leurs autorisations
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </button>
          </div>
          
          <UserTable 
            users={users} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onStatusToggle={handleStatusToggle}
          />

          {isFormOpen && (
            <UserForm
              user={currentUser}
              onSave={handleSaveUser}
              onCancel={() => setIsFormOpen(false)}
              isOpen={isFormOpen}
            />
          )}
        </main>
      </div>
    </div>
  );
}

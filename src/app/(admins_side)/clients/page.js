'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import AdminSidebar from '@/app/components/AdminSidebar';
import ClientForm from './ClientForm';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // Remplacer par un appel API réel
      // const response = await fetch('/api/admin/clients');
      // const data = await response.json();
      
      // Données de démonstration
      setTimeout(() => {
        setClients([
          { id: 1, name: 'Entreprise A', email: 'contact@entreprisea.com', phone: '0123456789', status: 'active', subscription: 'Premium', createdAt: '2025-01-15' },
          { id: 2, name: 'Entreprise B', email: 'contact@entrepriseb.com', phone: '0234567890', status: 'inactive', subscription: 'Basic', createdAt: '2025-02-20' },
          { id: 3, name: 'Entreprise C', email: 'contact@entreprisc.com', phone: '0345678901', status: 'active', subscription: 'Pro', createdAt: '2025-03-10' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setCurrentClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        // Remplacer par un appel API réel
        // await fetch(`/api/admin/clients/${clientId}`, { method: 'DELETE' });
        setClients(clients.filter(client => client.id !== clientId));
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
      }
    }
  };

  const handleFormSubmit = async (clientData) => {
    try {
      if (currentClient) {
        // Mise à jour d'un client existant
        // await fetch(`/api/admin/clients/${currentClient.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(clientData)
        // });
        setClients(clients.map(c => c.id === currentClient.id ? { ...c, ...clientData } : c));
      } else {
        // Création d'un nouveau client
        // const response = await fetch('/api/admin/clients', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(clientData)
        // });
        // const newClient = await response.json();
        const newClient = { id: Date.now(), ...clientData, status: 'active', createdAt: new Date().toISOString() };
        setClients([...clients, newClient]);
      }
      setIsFormOpen(false);
      setCurrentClient(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">

        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">Gestion des Clients</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <button
                  onClick={() => {
                    setCurrentClient(null);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus />
                  <span>Nouveau client</span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Chargement des clients...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonnement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{client.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{client.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{client.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                client.subscription === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                client.subscription === 'Pro' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {client.subscription}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {client.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(client)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FiEdit2 className="inline mr-1" /> Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(client.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="inline mr-1" /> Supprimer
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            Aucun client trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Formulaire de création/édition */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {currentClient ? 'Modifier le client' : 'Nouveau client'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setCurrentClient(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ClientForm
                client={currentClient}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setCurrentClient(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

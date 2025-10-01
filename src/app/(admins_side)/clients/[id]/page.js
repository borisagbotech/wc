'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit, FiTrash2, FiActivity, FiCreditCard, FiUser, FiCalendar, FiMail, FiPhone, FiGlobe } from 'react-icons/fi';
import Link from 'next/link';
import AdminSidebar from '@/app/components/AdminSidebar';

// Données factices pour la démo
const mockClient = {
  id: 1,
  name: 'Entreprise A',
  email: 'contact@entreprisea.com',
  phone: '01 23 45 67 89',
  website: 'www.entreprisea.com',
  status: 'active',
  subscription: 'Premium',
  subscriptionId: 'sub_123456789',
  subscriptionDate: '2025-01-15',
  renewalDate: '2026-01-15',
  address: '123 Rue de Paris',
  city: 'Paris',
  zipCode: '75000',
  country: 'France',
  siret: '123 456 789 00012',
  activity: [
    { id: 1, type: 'login', date: '2025-09-30T14:30:00', description: 'Connexion réussie' },
    { id: 2, type: 'campaign', date: '2025-09-29T10:15:00', description: 'Campagne "Promo Rentrée" envoyée' },
    { id: 3, type: 'payment', date: '2025-09-28T09:00:00', description: 'Paiement mensuel reçu' },
  ],
  campaigns: [
    { id: 1, name: 'Promo Rentrée', status: 'sent', sent: 1250, delivered: 1230, opened: 850, clicked: 320 },
    { id: 2, name: 'Nouveautés Septembre', status: 'draft', sent: 0, delivered: 0, opened: 0, clicked: 0 },
  ]
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation de chargement des données
    const fetchClient = async () => {
      try {
        // Dans une application réelle, vous feriez un appel API ici
        // const response = await fetch(`/api/admin/clients/${id}`);
        // const data = await response.json();
        // setClient(data);

        // Pour la démo, on utilise les données factices
        setTimeout(() => {
          setClient(mockClient);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement du client:', error);
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      try {
        // Remplacer par un appel API réel
        // await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
        router.push('/clients');
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Client non trouvé</h2>
          <p className="mt-2 text-gray-500">Le client demandé n'existe pas ou a été supprimé.</p>
          <Link
            href="/clients"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-1" /> Retour à la liste des clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 flex flex-col min-w-0">
          {/* En-tête avec boutons d'action */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold">{client.name}</h1>
                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {client.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/clients/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Navigation par onglets */}
            <nav className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUser className="inline mr-2" />
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiActivity className="inline mr-2" />
                Activité
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'subscription'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiCreditCard className="inline mr-2" />
                Abonnement
              </button>
            </nav>
          </header>

          {/* Contenu principal */}
          <div className="flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Carte d'information */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Informations du client</h3>
                  </div>
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                        <div className="flex items-center">
                          <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                          <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                            {client.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                        <div className="flex items-center">
                          <FiPhone className="h-5 w-5 text-gray-400 mr-2" />
                          <a href={`tel:${client.phone.replace(/\s/g, '')}`} className="text-gray-900">
                            {client.phone}
                          </a>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Site web</h4>
                        <div className="flex items-center">
                          <FiGlobe className="h-5 w-5 text-gray-400 mr-2" />
                          <a
                            href={`https://${client.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {client.website}
                          </a>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Abonnement</h4>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.subscription === 'Premium' ? 'bg-purple-100 text-purple-800' :
                            client.subscription === 'Pro' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {client.subscription}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Date d'inscription</h4>
                        <div className="flex items-center">
                          <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{new Date(client.subscriptionDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dernières activités */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Dernières activités</h3>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {client.activity.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <FiActivity className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {client.activity.map((activity) => (
                    <div key={activity.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <FiActivity className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.type === 'login' ? 'Connexion' :
                           activity.type === 'campaign' ? 'Campagne' : 'Paiement'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Abonnement</h3>
                    <p className="mt-1 text-sm text-gray-500">Gérez l'abonnement et les informations de facturation.</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Mettre à jour l'abonnement
                  </button>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-4">DÉTAILS DE L'ABONNEMENT</h4>
                      <dl className="space-y-4">
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Plan</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.subscription === 'Premium' ? 'bg-purple-100 text-purple-800' :
                              client.subscription === 'Pro' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {client.subscription}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">ID d'abonnement</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            {client.subscriptionId}
                          </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            {new Date(client.subscriptionDate).toLocaleDateString('fr-FR')}
                          </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Prochain renouvellement</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            {new Date(client.renewalDate).toLocaleDateString('fr-FR')}
                          </dd>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Statut</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {client.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-4">UTILISATION</h4>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                            <span>Campagnes ce mois-ci</span>
                            <span>3/50</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '6%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                            <span>Contacts</span>
                            <span>1,250/10,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '12.5%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                            <span>Stockage des fichiers</span>
                            <span>45MB/5GB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '0.9%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">CAMPAGNES RÉCENTES</h4>
                        <div className="space-y-4">
                          {client.campaigns.map((campaign) => (
                            <div key={campaign.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    {campaign.status === 'sent'
                                      ? `Envoyée le ${new Date().toLocaleDateString('fr-FR')}`
                                      : 'Brouillon'}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                                </span>
                              </div>
                              {campaign.status === 'sent' && (
                                <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Envoyés</p>
                                    <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Ouvertures</p>
                                    <p className="text-lg font-semibold">
                                      {Math.round((campaign.opened / campaign.sent) * 100)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Clics</p>
                                    <p className="text-lg font-semibold">
                                      {Math.round((campaign.clicked / campaign.sent) * 100)}%
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

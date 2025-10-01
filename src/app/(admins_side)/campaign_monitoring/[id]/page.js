// src/app/(admins_side)/campaign_monitoring/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiRefreshCw, FiPause, FiPlay, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import CampaignDetails from './components/CampaignDetails';
import CampaignKPIs from './components/CampaignKPIs';
import CampaignLogs from './components/CampaignLogs';
import CampaignTimeline from './components/CampaignTimeline';

export default function CampaignDetailPage() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/campaigns/${id}`);
            if (!response.ok) {
                throw new Error('Campagne non trouvée');
            }
            const data = await response.json();
            setCampaign(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch(`/api/logs/${id}`);
            if (!response.ok) {
                throw new Error('Impossible de charger les logs');
            }
            const data = await response.json();
            setLogs(data.data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    const handleStatusToggle = async () => {
        if (!campaign) return;

        const newStatus = campaign.status === 'Paused' ? 'Running' : 'Paused';

        try {
            const response = await fetch(`/api/campaigns/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Échec de la mise à jour du statut');
            }

            setCampaign({ ...campaign, status: newStatus });
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCampaign();
            fetchLogs();
        }
    }, [id]);

    // Mise à jour périodique des données
    useEffect(() => {
        const interval = setInterval(() => {
            if (campaign?.status === 'Running') {
                fetchCampaign();
                fetchLogs();
            }
        }, 10000); // Toutes les 10 secondes

        return () => clearInterval(interval);
    }, [campaign?.status]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FiRefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {error || 'Impossible de charger les détails de la campagne'}
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/campaign_monitoring"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la liste
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center">
                        <Link
                            href="/campaign_monitoring"
                            className="mr-4 text-gray-400 hover:text-gray-600"
                            title="Retour"
                        >
                            <FiArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-900">{campaign.name}</h1>
                    </div>
                    <p className="ml-9 mt-1 text-sm text-gray-500">
                        {campaign.client_name} • Créée le {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {['Running', 'Paused'].includes(campaign.status) && (
                        <button
                            onClick={handleStatusToggle}
                            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                campaign.status === 'Paused'
                                    ? 'border-transparent bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
                            }`}
                        >
                            {campaign.status === 'Paused' ? (
                                <FiPlay className="mr-2 h-4 w-4" />
                            ) : (
                                <FiPause className="mr-2 h-4 w-4" />
                            )}
                            {campaign.status === 'Paused' ? 'Reprendre' : 'Mettre en pause'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            fetchCampaign();
                            fetchLogs();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiRefreshCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </button>
                </div>
            </div>

            <CampaignDetails campaign={campaign} />
            <CampaignTimeline status={campaign.status} />
            <CampaignKPIs logs={logs} />
            <CampaignLogs logs={logs} campaignId={id} onRefresh={fetchLogs} />
        </div>
    );
}
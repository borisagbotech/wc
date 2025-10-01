// src/app/(admins_side)/campaign_monitoring/components/CampaignsTable.jsx
'use client';

import Link from 'next/link';
import { FiRefreshCw, FiPause, FiPlay, FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import StatusBadge from '../[id]/components/StatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CampaignsTable({ campaigns, isLoading, onRefresh, pagination, onPageChange }) {
    const handleStatusToggle = async (campaignId, currentStatus) => {
        const newStatus = currentStatus === 'Paused' ? 'Running' : 'Paused';
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Échec de la mise à jour du statut');
            }
            
            onRefresh();
        } catch (error) {
            console.error('Error updating campaign status:', error);
            alert(error.message || 'Une erreur est survenue lors de la mise à jour du statut');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <FiRefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Créée le
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        <Link
                                            href={`/campaign_monitoring/${campaign.id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {campaign.name}
                                        </Link>
                                    </div>
                                    <div className="text-sm text-gray-500 line-clamp-1">
                                        {campaign.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {campaign.client_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={campaign.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(campaign.created_at), 'PPpp', { locale: fr })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/campaign_monitoring/${campaign.id}`}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                            title="Voir les détails"
                                        >
                                            <FiExternalLink className="h-4 w-4" />
                                        </Link>
                                        {['Running', 'Paused'].includes(campaign.status) && (
                                            <button
                                                onClick={() => handleStatusToggle(campaign.id, campaign.status)}
                                                className={`p-1 rounded-full ${
                                                    campaign.status === 'Paused'
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-yellow-600 hover:bg-yellow-50'
                                                }`}
                                                title={campaign.status === 'Paused' ? 'Reprendre' : 'Mettre en pause'}
                                            >
                                                {campaign.status === 'Paused' ? (
                                                    <FiPlay className="h-4 w-4" />
                                                ) : (
                                                    <FiPause className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                Aucune campagne trouvée
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                pagination.page === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                            disabled={pagination.page >= pagination.totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                pagination.page >= pagination.totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> à{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span>{' '}
                                sur <span className="font-medium">{pagination.total}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        pagination.page === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Précédent</span>
                                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                pagination.page === pageNum
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        pagination.page >= pagination.totalPages
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Suivant</span>
                                    <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
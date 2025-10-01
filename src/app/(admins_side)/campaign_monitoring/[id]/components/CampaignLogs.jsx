'use client';

import { useState } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors = {
    Queued: 'bg-gray-100 text-gray-800',
    Sent: 'bg-blue-100 text-blue-800',
    Delivered: 'bg-green-100 text-green-800',
    Read: 'bg-purple-100 text-purple-800',
    Failed: 'bg-red-100 text-red-800',
};

export default function CampaignLogs({ logs, campaignId, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.recipient.includes(searchTerm) ||
            (log.error_reason && log.error_reason.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || log.message_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        const headers = ['Destinataire', 'Statut', 'Date', 'Détails de l erreur'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                `"${log.recipient}"`,
                log.message_status,
                new Date(log.timestamp).toISOString(),
                `"${log.error_reason || ''}"`
            ].map(field => field || '').join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `campaign-${campaignId}-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Historique des messages</h2>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <button
                            onClick={onRefresh}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Actualiser
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiDownload className="mr-2 h-4 w-4" />
                            Exporter en CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Rechercher un numéro ou une erreur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FiFilter className="h-4 w-4 text-gray-400" />
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Queued">En attente</option>
                            <option value="Sent">Envoyé</option>
                            <option value="Delivered">Livré</option>
                            <option value="Read">Lu</option>
                            <option value="Failed">Échoué</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destinataire
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Détails
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.recipient}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[log.message_status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.message_status}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(log.timestamp), 'PPpp', { locale: fr })}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.error_reason || '-'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                Aucun log trouvé
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {filteredLogs.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Affichage de <span className="font-medium">1</span> à{' '}
                        <span className="font-medium">{filteredLogs.length}</span> sur{' '}
                        <span className="font-medium">{logs.length}</span> messages
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
                            disabled={filteredLogs.length <= 20}
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
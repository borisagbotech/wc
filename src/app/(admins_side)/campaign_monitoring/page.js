// src/app/(admins_side)/campaign_monitoring/page.js
'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import CampaignsTable from './components/CampaignsTable';
import CampaignFilters from './components/CampaignFilters';
import CreateCampaignModal from './components/CreateCampaignModal';

export default function CampaignMonitoring() {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const [filters, setFilters] = useState({
        status: '',
        client: '',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fonction pour récupérer les campagnes avec les filtres actuels
    const fetchCampaigns = async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: pagination.limit,
                ...(filters.status && { status: filters.status }),
                ...(filters.client && { client: filters.client }),
                ...(filters.search && { search: filters.search })
            });

            const apiUrl = `/api/admin/campaigns?${queryParams.toString()}`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-is-admin': 'true',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors du chargement des campagnes');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Erreur lors du chargement des campagnes');
            }

            setCampaigns(Array.isArray(result.data) ? result.data : []);
            
            if (result.pagination) {
                setPagination(prev => ({
                    ...prev,
                    page: result.pagination.page || page,
                    total: result.pagination.total || 0,
                    totalPages: result.pagination.totalPages || 1
                }));
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des campagnes:', err);
            setError(err.message || 'Une erreur est survenue lors du chargement des campagnes');
            setCampaigns([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour créer une nouvelle campagne
    const handleCreateCampaign = async (campaignData) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch('/api/admin/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-is-admin': 'true'
                },
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de la création de la campagne');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Erreur lors de la création de la campagne');
            }

            await fetchCampaigns();
            return { success: true };
        } catch (err) {
            console.error('Erreur lors de la création de la campagne:', err);
            return { 
                success: false, 
                error: err.message || 'Erreur lors de la création de la campagne' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour mettre à jour le statut d'une campagne
    const updateCampaignStatus = async (campaignId, newStatus) => {
        try {
            const response = await fetch('/api/admin/campaigns', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-is-admin': 'true'
                },
                body: JSON.stringify({
                    id: campaignId,
                    status: newStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de la mise à jour de la campagne');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Erreur lors de la mise à jour de la campagne');
            }

            setCampaigns(prevCampaigns => 
                prevCampaigns.map(camp => 
                    camp.id === campaignId 
                        ? { ...camp, status: newStatus, updated_at: new Date().toISOString() } 
                        : camp
                )
            );
            
            return { success: true };
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            return { 
                success: false, 
                error: err.message || 'Erreur lors de la mise à jour du statut' 
            };
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchCampaigns(newPage);
        }
    };

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            client: '',
            search: ''
        });
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Gestion des campagnes</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez et surveillez vos campagnes WhatsApp
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiFilter className="mr-2 h-4 w-4" />
                        Filtres
                    </button>
                    <button
                        onClick={() => fetchCampaigns()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Nouvelle campagne
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <CampaignFilters
                        filters={filters}
                        onApplyFilters={applyFilters}
                        onResetFilters={resetFilters}
                    />
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Rechercher une campagne..."
                            value={filters.search}
                            onChange={(e) => applyFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
                
                <CampaignsTable
                    campaigns={campaigns}
                    loading={isLoading}
                    onStatusChange={updateCampaignStatus}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>

            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateCampaign={handleCreateCampaign}
            />
        </div>
    );
}

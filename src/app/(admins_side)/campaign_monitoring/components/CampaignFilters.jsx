import { useState, useEffect } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Listbox } from '@headlessui/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusOptions = [
  { id: 'all', name: 'Tous les statuts' },
  { id: 'pending', name: 'En attente' },
  { id: 'running', name: 'En cours' },
  { id: 'completed', name: 'Terminées' },
  { id: 'failed', name: 'Échouées' },
  { id: 'paused', name: 'En pause' },
];

const clientOptions = [
  { id: 'all', name: 'Tous les clients' },
  { id: 'client1', name: 'Client 1' },
  { id: 'client2', name: 'Client 2' },
  { id: 'client3', name: 'Client 3' },
];

export default function CampaignFilters({ filters, onFilterChange }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [selectedClient, setSelectedClient] = useState(clientOptions[0]);
  const [dateRange, setDateRange] = useState({
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
  });

  // Mettre à jour les filtres quand les sélections changent
  useEffect(() => {
    const newFilters = {
      status: selectedStatus.id !== 'all' ? selectedStatus.id : '',
      client: selectedClient.id !== 'all' ? selectedClient.id : '',
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
    onFilterChange(newFilters);
  }, [selectedStatus, selectedClient, dateRange, onFilterChange]);

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    setDateRange(prev => ({
      ...prev,
      [type]: value ? new Date(value) : null
    }));
  };

  const clearFilters = () => {
    setSelectedStatus(statusOptions[0]);
    setSelectedClient(clientOptions[0]);
    setDateRange({ startDate: null, endDate: null });
    // La fonction onFilterChange sera appelée automatiquement par l'effet
  };

  const hasActiveFilters = 
    selectedStatus.id !== 'all' || 
    selectedClient.id !== 'all' || 
    dateRange.startDate || 
    dateRange.endDate;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        <div className="flex space-x-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Réinitialiser
            </button>
          )}
          <button
            type="button"
            className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {showMobileFilters ? 'Masquer' : 'Filtres'}
          </button>
        </div>
      </div>

      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par statut */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Listbox value={selectedStatus} onChange={setSelectedStatus}>
              <div className="relative">
                <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <span className="block truncate">{selectedStatus.name}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {statusOptions.map((status) => (
                    <Listbox.Option
                      key={status.id}
                      className={({ active }) =>
                        `${active ? 'text-white bg-indigo-600' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                      value={status}
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`${selected ? 'font-semibold' : 'font-normal'} block truncate`}>
                            {status.name}
                          </span>
                          {selected ? (
                            <span
                              className={`${active ? 'text-white' : 'text-indigo-600'}
                                absolute inset-y-0 right-0 flex items-center pr-4`}
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Filtre par client */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <Listbox value={selectedClient} onChange={setSelectedClient}>
              <div className="relative">
                <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <span className="block truncate">{selectedClient.name}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {clientOptions.map((client) => (
                    <Listbox.Option
                      key={client.id}
                      className={({ active }) =>
                        `${active ? 'text-white bg-indigo-600' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-3 pr-9`
                      }
                      value={client}
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`${selected ? 'font-semibold' : 'font-normal'} block truncate`}>
                            {client.name}
                          </span>
                          {selected ? (
                            <span
                              className={`${active ? 'text-white' : 'text-indigo-600'}
                                absolute inset-y-0 right-0 flex items-center pr-4`}
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Filtre par date de début */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={dateRange.startDate ? format(new Date(dateRange.startDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(e, 'startDate')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Filtre par date de fin */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={dateRange.endDate ? format(new Date(dateRange.endDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(e, 'endDate')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

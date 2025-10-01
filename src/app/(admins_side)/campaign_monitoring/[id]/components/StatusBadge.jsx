// src/app/(admins_side)/campaign_monitoring/[id]/components/StatusBadge.jsx
'use client';

const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Running: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Paused: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
    Pending: 'En attente',
    Running: 'En cours',
    Completed: 'Terminée',
    Failed: 'Échouée',
    Paused: 'En pause',
};

export default function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[status] || 'bg-gray-100 text-gray-800'
            }`}
        >
      {statusLabels[status] || status}
    </span>
    );
}
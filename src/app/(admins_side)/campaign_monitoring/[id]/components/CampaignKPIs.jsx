'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = {
    Queued: '#9CA3AF',
    Sent: '#3B82F6',
    Delivered: '#10B981',
    Read: '#8B5CF6',
    Failed: '#EF4444',
};

export default function CampaignKPIs({ logs }) {
    // Calcule les KPIs
    const getKPIData = () => {
        const statusCounts = logs.reduce((acc, log) => {
            acc[log.message_status] = (acc[log.message_status] || 0) + 1;
            return acc;
        }, {});

        const total = logs.length;
        const successCount = statusCounts['Delivered'] || 0;
        const readCount = statusCounts['Read'] || 0;
        const failedCount = statusCounts['Failed'] || 0;

        return {
            total,
            delivered: total > 0 ? Math.round((successCount / total) * 100) : 0,
            readRate: successCount > 0 ? Math.round((readCount / successCount) * 100) : 0,
            failureRate: total > 0 ? Math.round((failedCount / total) * 100) : 0,
            statusCounts: Object.entries(statusCounts).map(([status, count]) => ({
                status,
                count,
                percentage: Math.round((count / total) * 100) || 0,
            })),
        };
    };

    const kpiData = getKPIData();
    const chartData = kpiData.statusCounts.map(item => ({
        name: item.status,
        value: item.count,
        color: COLORS[item.status] || '#9CA3AF',
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Messages envoyés</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {kpiData.total.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Taux de livraison</h3>
                    <p className="mt-1 text-2xl font-semibold text-green-600">
                        {kpiData.delivered}%
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Taux de lecture</h3>
                    <p className="mt-1 text-2xl font-semibold text-purple-600">
                        {kpiData.readRate}%
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Taux d'échec</h3>
                    <p className="mt-1 text-2xl font-semibold text-red-600">
                        {kpiData.failureRate}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Répartition des statuts</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} messages`, 'Nombre']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Activité récente</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={getActivityData(logs)}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip formatter={(value) => [value, 'Messages']} />
                                <Legend />
                                <Bar dataKey="count" name="Messages" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Fonction utilitaire pour regrouper les logs par heure
function getActivityData(logs) {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(now);
        date.setHours(i, 0, 0, 0);
        return {
            hour: date.toLocaleTimeString('fr-FR', { hour: '2-digit' }),
            count: 0,
        };
    });

    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const hour = logDate.getHours();
        if (hours[hour]) {
            hours[hour].count++;
        }
    });

    return hours;
}
'use client';

import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

const statuses = {
    Pending: { icon: ClockIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    Running: { icon: PlayIcon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    Paused: { icon: PauseIcon, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    Completed: { icon: CheckCircleIcon, color: 'text-green-500', bgColor: 'bg-green-100' },
    Failed: { icon: ExclamationCircleIcon, color: 'text-red-500', bgColor: 'bg-red-100' },
};

const steps = [
    { id: 'Pending', name: 'En attente', description: 'La campagne est en attente de démarrage' },
    { id: 'Running', name: 'En cours', description: 'Envoi des messages en cours' },
    { id: 'Completed', name: 'Terminée', description: 'Tous les messages ont été envoyés' },
];

export default function CampaignTimeline({ status }) {
    const currentStep = steps.findIndex(step => step.id === status);

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Progression de la campagne</h2>
            </div>
            <div className="px-6 py-4">
                <nav aria-label="Progress">
                    <ol className="overflow-hidden">
                        {steps.map((step, stepIdx) => {
                            const status = stepIdx < currentStep
                                ? 'complete'
                                : stepIdx === currentStep
                                    ? 'current'
                                    : 'upcoming';
                            const stepStatus = statuses[step.id] || statuses.Pending;
                            const Icon = stepStatus.icon;

                            return (
                                <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pb-10' : ''} relative`}>
                                    {status === 'complete' ? (
                                        <>
                                            {stepIdx !== steps.length - 1 && (
                                                <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-blue-600" aria-hidden="true" />
                                            )}
                                            <div className="relative flex items-start group">
                        <span className="h-9 flex items-center">
                          <span className={`relative z-10 w-8 h-8 flex items-center justify-center ${stepStatus.bgColor} rounded-full`}>
                            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                          </span>
                        </span>
                                                <span className="ml-4 min-w-0 flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{step.name}</span>
                          <span className="text-sm text-gray-500">{step.description}</span>
                        </span>
                                            </div>
                                        </>
                                    ) : status === 'current' ? (
                                        <>
                                            {stepIdx !== steps.length - 1 && (
                                                <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                                            )}
                                            <div className="relative flex items-start" aria-current="step">
                        <span className="h-9 flex items-center" aria-hidden="true">
                          <span className={`relative z-10 w-8 h-8 flex items-center justify-center ${stepStatus.bgColor} rounded-full border-2 border-blue-600`}>
                            <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                          </span>
                        </span>
                                                <span className="ml-4 min-w-0 flex flex-col">
                          <span className="text-sm font-medium text-blue-600">{step.name}</span>
                          <span className="text-sm text-gray-500">{step.description}</span>
                        </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {stepIdx !== steps.length - 1 && (
                                                <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                                            )}
                                            <div className="relative flex items-start group">
                        <span className="h-9 flex items-center" aria-hidden="true">
                          <span className={`relative z-10 w-8 h-8 flex items-center justify-center ${stepStatus.bgColor} rounded-full border-2 border-gray-300`}>
                            <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" />
                          </span>
                        </span>
                                                <span className="ml-4 min-w-0 flex flex-col">
                          <span className="text-sm font-medium text-gray-500">{step.name}</span>
                          <span className="text-sm text-gray-500">{step.description}</span>
                        </span>
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>
        </div>
    );
}
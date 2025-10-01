import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CreateCampaignModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    description: '',
    startDate: '',
    endDate: '',
    message: '',
    recipients: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const clients = [
    { id: '1', name: 'Client 1' },
    { id: '2', name: 'Client 2' },
    { id: '3', name: 'Client 3' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation simple
    if (!formData.name || !formData.clientId || !formData.message) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Formater les données pour l'API
      const campaignData = {
        name: formData.name,
        clientId: formData.clientId,
        description: formData.description,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate,
        message: formData.message,
        recipients: formData.recipients.split('\n').filter(Boolean),
      };

      await onSubmit(campaignData);
      
      // Réinitialiser le formulaire après soumission réussie
      setFormData({
        name: '',
        clientId: '',
        description: '',
        startDate: '',
        endDate: '',
        message: '',
        recipients: '',
      });
      
      onClose();
    } catch (err) {
      console.error('Erreur lors de la création de la campagne:', err);
      setError('Une erreur est survenue lors de la création de la campagne');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Nouvelle campagne
                    </Dialog.Title>
                    
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nom de la campagne <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                            Client <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="clientId"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            required
                          >
                            <option value="">Sélectionnez un client</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            Date de début
                          </label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            id="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            Date de fin
                          </label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            id="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <textarea
                              rows={4}
                              name="message"
                              id="message"
                              value={formData.message}
                              onChange={handleChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Écrivez votre message ici..."
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
                            Destinataires (un par ligne) <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <textarea
                              rows={6}
                              name="recipients"
                              id="recipients"
                              value={formData.recipients}
                              onChange={handleChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-sm"
                              placeholder="+33612345678\n+33787654321\n..."
                              required
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Saisissez un numéro de téléphone par ligne, au format international (ex: +33612345678)
                          </p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (optionnel)
                          </label>
                          <div className="mt-1">
                            <textarea
                              rows={3}
                              name="description"
                              id="description"
                              value={formData.description}
                              onChange={handleChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Description de la campagne..."
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${
                            isSubmitting
                              ? 'bg-indigo-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                          }`}
                        >
                          {isSubmitting ? 'Création en cours...' : 'Créer la campagne'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                          onClick={onClose}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

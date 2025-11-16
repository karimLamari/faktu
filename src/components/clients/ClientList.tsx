"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClientForm from "./ClientForm";
import ClientCard from "./ClientCard";
import InvoiceFormModal from "../invoices/InvoiceFormModal";
import { z } from "zod";
import { clientSchema } from "@/lib/validations";
import { useFormModal, useModalState, useFilters, useNotification } from "@/hooks";
import { clientService, invoiceService } from "@/services";
import { ManagementLayout } from '@/components/common/ManagementLayout';
import { FiSearch } from 'react-icons/fi';
import { Notification as NotificationComponent } from '@/components/common/Notification';
import { Users } from 'lucide-react';
import { UsageBar } from '@/components/subscription/UsageBar';
import { LimitReachedModal } from '@/components/subscription/LimitReachedModal';
import { useSubscription } from '@/hooks';
import { PLANS } from '@/lib/subscription/plans';

export type Client = z.infer<typeof clientSchema> & { _id: string };


type ClientListProps = {
	initialClients: Client[];
	isProfileComplete: boolean;
};

const ClientList: React.FC<ClientListProps> = ({ initialClients, isProfileComplete }) => {
	const [clients, setClients] = useState<Client[]>(initialClients);
	const [showLimitModal, setShowLimitModal] = useState(false);
	const [limitModalType, setLimitModalType] = useState<'invoices' | 'quotes' | 'expenses' | 'clients'>('clients');
	
	// Subscription
	const { data: subscriptionData } = useSubscription();
	const usage = subscriptionData?.usage;
	const plan = subscriptionData?.plan;
	
	// Hooks personnalisés
	const { showSuccess, showError, notification } = useNotification();
	
	// Modal d'ajout de client
	const addModal = useFormModal<Client>({
		onSubmit: async (data) => {
			// Nettoyer les données selon le type
			const cleanedForm = { ...data };
			if (cleanedForm.type === 'individual') {
				delete cleanedForm.companyInfo;
			} else if (cleanedForm.type === 'business') {
				delete cleanedForm.firstName;
				delete cleanedForm.lastName;
			}
			
			try {
				const saved = await clientService.create(cleanedForm);
				setClients((prev) => [saved, ...prev]);
				showSuccess('Client ajouté avec succès');
			} catch (error: any) {
				if (error.response?.data?.limitReached) {
					showError(error.response.data.error || 'Limite de clients atteinte');
					setLimitModalType('clients');
					setShowLimitModal(true);
				}
				throw error;
			}
		},
		initialValues: { type: 'individual', paymentTerms: 30, isActive: true },
	});
	
	// Fonction wrapper pour le formulaire d'ajout (sans événement)
	const handleAddSubmit = async (data: any) => {
		try {
			const cleanedForm = { ...data };
			if (cleanedForm.type === 'individual') {
				delete cleanedForm.companyInfo;
			} else if (cleanedForm.type === 'business') {
				delete cleanedForm.firstName;
				delete cleanedForm.lastName;
			}
			
			const saved = await clientService.create(cleanedForm);
			setClients((prev) => [saved, ...prev]);
			showSuccess('Client ajouté avec succès');
			addModal.close();
		} catch (error: any) {
			if (error.response?.data?.limitReached) {
				showError(error.response.data.error || 'Limite de clients atteinte');
				setLimitModalType('clients');
				setShowLimitModal(true);
			}
			throw error;
		}
	};
	
	// Modal d'édition de client
	const editModal = useFormModal<Client>({
		onSubmit: async (data) => {
			if (!data._id) return;
			const updated = await clientService.update(data._id, data);
			setClients((prev) => prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)));
			showSuccess('Client modifié avec succès');
		},
	});
	
	// Fonction wrapper pour le formulaire d'édition (sans événement)
	const handleEditSubmit = async (data: any) => {
		if (!data._id) return;
		const updated = await clientService.update(data._id, data);
		setClients((prev) => prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)));
		showSuccess('Client modifié avec succès');
		editModal.close();
	};
	
	// Modal de création de facture
	const invoiceModal = useModalState<Client>();
	const [invoiceForm, setInvoiceForm] = useState<any>({
		clientId: "",
		issueDate: new Date().toISOString().slice(0, 10),
		dueDate: "",
		items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, unit: "unit" }],
		paymentStatus: "pending",
		paymentMethod: "bank_transfer",
		subtotal: 0,
		taxAmount: 0,
		total: 0,
		balanceDue: 0,
		amountPaid: 0,
		notes: "",
	});
	const [invoiceFormError, setInvoiceFormError] = useState<string | null>(null);
	const [invoiceFormLoading, setInvoiceFormLoading] = useState(false);
	
	// Filtres
	const { filters, setFilter, filteredData: filteredClients } = useFilters({
		data: clients,
		filterFunctions: {
			search: (client, value) => {
				if (!value) return true;
				return (client.name || '').toLowerCase().includes(value.toLowerCase());
			},
		},
	});
	
	// Handler pour ouvrir le modal de création de facture
	const handleNewInvoice = (client: Client) => {
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + (client.paymentTerms || 30));
		setInvoiceForm({
			...invoiceForm,
			clientId: client._id,
			dueDate: dueDate.toISOString().slice(0, 10),
		});
		invoiceModal.open(client);
	};

	const handleInvoiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setInvoiceForm((prev: any) => ({ ...prev, [name]: value }));
	};

	const handleInvoiceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setInvoiceFormLoading(true);
		setInvoiceFormError(null);
		try {
			await invoiceService.create(invoiceForm);
			showSuccess('Facture créée avec succès');
			invoiceModal.close();
			// Réinitialiser le formulaire
			setInvoiceForm({
				clientId: "",
				issueDate: new Date().toISOString().slice(0, 10),
				dueDate: "",
				items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0, unit: "unit" }],
				paymentStatus: "pending",
				paymentMethod: "bank_transfer",
				subtotal: 0,
				taxAmount: 0,
				total: 0,
				balanceDue: 0,
				amountPaid: 0,
				notes: "",
			});
		} catch (e: any) {
			setInvoiceFormError(e.message || "Erreur inconnue");
		} finally {
			setInvoiceFormLoading(false);
		}
	};
	
	const handleDelete = async (id: string) => {
		if (!window.confirm("Supprimer ce client ?")) return;
		try {
			await clientService.delete(id);
			setClients((prev) => prev.filter((c) => c._id !== id));
			showSuccess('Client supprimé avec succès');
		} catch (e: any) {
			showError(e.message || "Erreur lors de la suppression");
		}
	};
	
	// Stats pour les cards
	const totalClients = clients.length;
	const activeClients = clients.filter(c => c.isActive !== false).length;
	
	// Filtres JSX
	const filtersComponent = (
		<div className="bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 border border-gray-700/50">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<FiSearch className="h-5 w-5 text-gray-500" />
				</div>
				<input
					type="text"
					placeholder="Rechercher un client par nom..."
					value={filters.search || ''}
					onChange={(e) => setFilter('search', e.target.value)}
					className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
				/>
			</div>
		</div>
	);

	return (
		<>
			{/* Usage Bar */}
			{usage?.clients && plan && (
				<div className="mb-6">
					<UsageBar
						current={usage.clients.current}
						limit={usage.clients.limit}
						label="Clients"
						upgradeLink="/dashboard/pricing"
					/>
				</div>
			)}

			<ManagementLayout
				title="Clients"
				subtitle={`${filteredClients.length} client${filteredClients.length > 1 ? 's' : ''} trouvé${filteredClients.length > 1 ? 's' : ''}`}
				icon={Users}
				buttonLabel="Nouveau client"
				onButtonClick={() => addModal.openNew()}
				filters={filtersComponent}
				isEmpty={filteredClients.length === 0 && clients.length === 0}
				emptyMessage="Aucun client pour l'instant"
				emptyDescription="Ajoutez votre premier client pour commencer !"
				notification={notification}
			>
				{filteredClients.length === 0 ? (
					<div className="col-span-full text-center py-12 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700/50">
						<p className="text-gray-300 text-lg">Aucun client trouvé</p>
						<p className="text-gray-500 text-sm mt-2">Essayez de modifier votre recherche</p>
						<Button onClick={() => setFilter('search', '')} className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20">
							Réinitialiser la recherche
						</Button>
					</div>
				) : (
					filteredClients.map((client) => (
						<ClientCard
							key={client._id}
							client={client}
							loading={false}
							onEdit={editModal.openEdit}
							onDelete={handleDelete}
							onNewInvoice={handleNewInvoice}
						/>
					))
				)}
			</ManagementLayout>

			{/* Modal ajout client */}
			{addModal.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
					<div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in-up">
						{/* Header modal */}
						<div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
							<h2 className="text-2xl font-bold">Nouveau client</h2>
							<p className="text-sm text-green-100">Ajoutez un nouveau client à votre base</p>
						</div>

						{/* Body modal */}
					<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
						<ClientForm
							initialData={addModal.formData}
							onSubmit={handleAddSubmit}
							onCancel={addModal.close}
							submitLabel="Ajouter le client"
							cancelLabel="Annuler"
						/>
					</div>
					</div>
				</div>
			)}

			{/* Modal modification client */}
			{editModal.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
					<div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in-up">
						{/* Header modal */}
						<div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
							<h2 className="text-2xl font-bold">Modifier le client</h2>
							<p className="text-sm text-blue-100">Mettez à jour les informations du client</p>
						</div>

						{/* Body modal */}
					<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
						<ClientForm
							initialData={editModal.formData}
							onSubmit={handleEditSubmit}
							onCancel={editModal.close}
							submitLabel="Enregistrer les modifications"
							cancelLabel="Annuler"
								isEdit
							/>
						</div>
					</div>
				</div>
			)}

			{/* Modal création facture */}
			{invoiceModal.isOpen && invoiceModal.data && (
				<InvoiceFormModal
					open={invoiceModal.isOpen}
					onClose={() => {
						invoiceModal.close();
						setInvoiceFormError(null);
					}}
					onSubmit={handleInvoiceSubmit}
					form={invoiceForm}
					setForm={setInvoiceForm}
					formError={invoiceFormError}
					formLoading={invoiceFormLoading}
				clients={clients.map(c => ({ _id: c._id, name: c.name || 'Client' }))}
				editMode={false}
				handleFormChange={handleInvoiceFormChange}
				/>
			)}

			{/* Limit Reached Modal */}
			{showLimitModal && subscriptionData && (
				<LimitReachedModal
					isOpen={showLimitModal}
					onClose={() => setShowLimitModal(false)}
					limitType={limitModalType}
					currentUsage={subscriptionData.usage?.clients?.current || 0}
					limit={subscriptionData.usage?.clients?.limit === 'unlimited' ? 999 : (subscriptionData.usage?.clients?.limit || 5)}
					currentPlan={subscriptionData.plan}
				/>
			)}
		</>
	);
};

export default ClientList;

type Client = z.infer<typeof clientSchema> & { _id: string };
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClientForm from "./ClientForm";
import { z } from "zod";
import { clientSchema } from "@/lib/validations";
import { EmptyStateButton } from "../ui/EmptyStateButton";


type ClientListProps = {
	initialClients: Client[];
};

const ClientList: React.FC<ClientListProps> = ({ initialClients }) => {
	const [clients, setClients] = useState<Client[]>(initialClients);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
		const [notif, setNotif] = useState<string | null>(null);
		const [editClient, setEditClient] = useState<Client | null>(null);
		const [editForm, setEditForm] = useState<Partial<Client> | null>(null);
		const [editError, setEditError] = useState<string | null>(null);
		const [editLoading, setEditLoading] = useState(false);
	const openEdit = (client: Client) => {
		setEditClient(client);
		setEditForm({ ...client });
		setEditError(null);
	};

	const closeEdit = () => {
		setEditClient(null);
		setEditForm(null);
		setEditError(null);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		if (!editForm) return;
		const { name, value, type } = e.target;
		if (name.startsWith('address.')) {
			const key = name.split('.')[1];
			setEditForm((prev) => ({ ...prev, address: { ...prev?.address, [key]: value } }));
		} else if (name.startsWith('companyInfo.')) {
			const key = name.split('.')[1];
			setEditForm((prev) => ({ ...prev, companyInfo: { ...prev?.companyInfo, [key]: value } }));
		} else if (name === 'paymentTerms') {
			setEditForm((prev) => ({ ...prev, paymentTerms: Number(value) }));
		} else if (name === 'isActive' && type === 'checkbox') {
			setEditForm((prev) => ({ ...prev, isActive: (e.target as HTMLInputElement).checked }));
		} else {
			setEditForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editClient || !editForm) return;
		setEditLoading(true);
		setEditError(null);
		setNotif(null);
		try {
			const res = await fetch(`/api/clients/${editClient._id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editForm),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Erreur lors de la modification");
			}
			const updated = await res.json();
			setClients((prev) => prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)));
			setNotif("Client modifié avec succès.");
			closeEdit();
		} catch (e: any) {
			setEditError(e.message || "Erreur inconnue");
		} finally {
			setEditLoading(false);
			setTimeout(() => setNotif(null), 3000);
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm("Supprimer ce client ?")) return;
		setLoading(true);
		setError(null);
		setNotif(null);
		try {
			const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Erreur lors de la suppression");
			}
			setClients((prev) => prev.filter((c) => c._id !== id));
			setNotif("Client supprimé avec succès.");
		} catch (e: any) {
			setError(e.message || "Erreur inconnue");
		} finally {
			setLoading(false);
			setTimeout(() => setNotif(null), 3000);
		}
	};

		const filteredClients = clients.filter((client) =>
			client.name.toLowerCase().includes(search.toLowerCase())
		);

		// Ajout client
		const [addOpen, setAddOpen] = useState(false);
				  type ClientForm = Partial<Client> & { isActive?: boolean };
				const [addForm, setAddForm] = useState<ClientForm>({ type: 'business', paymentTerms: 30, isActive: true });
		const [addError, setAddError] = useState<string | null>(null);
		const [addLoading, setAddLoading] = useState(false);

		const openAdd = () => {
			setAddForm({});
			setAddError(null);
			setAddOpen(true);
		};
		const closeAdd = () => {
			setAddOpen(false);
			setAddForm({});
			setAddError(null);
		};
				const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
					const { name, value, type } = e.target;
					if (name.startsWith('address.')) {
						const key = name.split('.')[1];
						setAddForm((prev) => ({ ...prev, address: { ...prev?.address, [key]: value } }));
					} else if (name.startsWith('companyInfo.')) {
						const key = name.split('.')[1];
						setAddForm((prev) => ({ ...prev, companyInfo: { ...prev?.companyInfo, [key]: value } }));
					} else if (name === 'paymentTerms') {
						setAddForm((prev) => ({ ...prev, paymentTerms: Number(value) }));
					} else if (name === 'isActive' && type === 'checkbox') {
						setAddForm((prev) => ({ ...prev, isActive: (e.target as HTMLInputElement).checked }));
					} else {
						setAddForm((prev) => ({ ...prev, [name]: value }));
					}
				};
		const handleAddSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			setAddLoading(true);
			setAddError(null);
			try {
				const res = await fetch('/api/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(addForm),
				});
				const data = await res.json();
				if (!res.ok) {
					// Affiche les erreurs Zod détaillées si présentes
					if (data && data.errors && Array.isArray(data.errors)) {
						setAddError(data.errors.map((err: any) => err.message).join(' | '));
					} else if (data.error) {
						setAddError(data.error);
					} else {
						setAddError('Erreur lors de la création');
					}
					return;
				}
				setClients((prev) => [data, ...prev]);
				setNotif('Client ajouté avec succès.');
				closeAdd();
			} catch (e: any) {
				setAddError(e.message || 'Erreur inconnue');
			} finally {
				setAddLoading(false);
				setTimeout(() => setNotif(null), 3000);
			}
		};

		return (
			<div className="space-y-6">
				{filteredClients.length > 0 && (
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<h2 className="text-xl font-bold">Clients</h2>
						<div className="flex gap-2">
							<Input
								placeholder="Rechercher un client..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="max-w-xs"
							/>
							<Button onClick={openAdd} variant="default">Ajouter un client</Button>
						</div>
					</div>
				)}
				{/* Modal ajout client */}
				{addOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
						<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto mx-2">
							<h2 className="text-lg font-bold mb-4">Ajouter un client</h2>
							<ClientForm
								form={addForm}
								onChange={handleAddChange}
								onSubmit={handleAddSubmit}
								loading={addLoading}
								error={addError}
								onCancel={closeAdd}
								submitLabel="Ajouter"
								cancelLabel="Annuler"
							/>
						</div>
					</div>
				)}
			{notif && <div className="text-green-600 font-medium">{notif}</div>}
			{error && <div className="text-red-600 font-medium">{error}</div>}
			{filteredClients.length === 0 ? (
				<EmptyStateButton
					label="Ajouter un client"
					onClick={openAdd}
					color="green"
					description="Aucun client pour l'instant. Ajoutez-en un pour commencer !"
				/>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{filteredClients.map((client) => {
						const address = client.address
							? [client.address.street, client.address.zipCode, client.address.city, client.address.country]
									.filter(Boolean)
									.join(", ")
							: "";
						return (
							<Card key={client._id} className="p-4 flex flex-col justify-between">
								<div>
									<h3 className="font-semibold text-lg mb-1">{client.name}</h3>
									<p className="text-sm text-gray-600">{client.email}</p>
									<p className="text-sm text-gray-600">{client.phone}</p>
									{address && <p className="text-sm text-gray-600">{address}</p>}
								</div>
								<div className="flex gap-2 mt-4">
									  <Button variant="outline" size="sm" onClick={() => openEdit(client)}>Modifier</Button>
																			<Button
																				variant="secondary"
																				size="sm"
																				onClick={() => {
																					if (typeof window !== 'undefined') {
																						const event = new CustomEvent('open-invoice-modal', { detail: { clientId: client._id } });
																						window.dispatchEvent(event);
																					}
																				}}
																			>
																				Nouvelle facture
																			</Button>
									  <Button variant="destructive" size="sm" onClick={() => handleDelete(client._id)}>
										Supprimer
									</Button>
								</div>
							</Card>
						);
					})}
				</div>
			)}
			</div>
		);
	};

export default ClientList;

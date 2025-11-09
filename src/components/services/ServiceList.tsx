'use client';

import ServiceCard from './ServiceCard';

interface ServiceListProps {
  services: any[];
  onEdit: (service: any) => void;
  onDelete: (serviceId: string) => void;
  onSelect?: (service: any) => void;
}

export default function ServiceList({ services, onEdit, onDelete, onSelect }: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service._id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export interface School {
    _id: string;
    name: string;
    address?: string;
    phone?: string;
    subdomain: string;
    status: 'active' | 'inactive' | 'suspended';
    logoUrl?: string;
    letterheadDetail?: string;
    createdAt?: string;
    updatedAt?: string;
}
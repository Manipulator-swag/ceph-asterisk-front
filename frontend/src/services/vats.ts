import { api } from './api';
import type { Vats, VatsCreateStep1, VatsCreateStep2 } from '@/types';

let mockVats: Vats[] = [
  {
    id: 1,
    name: 'Головной офис',
    status: 'active',
    server: 'asterisk-01',
    port: 5060,
    createdAt: '2025-10-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Филиал Москва',
    status: 'active',
    server: 'asterisk-02',
    port: 5061,
    createdAt: '2025-10-20T14:15:00Z',
  },
  {
    id: 3,
    name: 'Техподдержка',
    status: 'inactive',
    server: 'asterisk-01',
    port: 5062,
    createdAt: '2025-09-10T09:00:00Z',
  },
];

let nextId = 4;

export async function getVats(): Promise<Vats[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...mockVats]), 500));
}

export async function createVatsStep1(data: VatsCreateStep1): Promise<{ id: number }> {
  const newId = nextId++;
  const newVat: Vats = {
    id: newId,
    name: data.name,
    status: 'inactive',
    server: 'pending',
    port: 0,
    createdAt: new Date().toISOString(),
  };
  mockVats.push(newVat);
  return { id: newId };
}

export async function createVatsStep2(id: number, data: VatsCreateStep2): Promise<Vats> {
  const index = mockVats.findIndex(v => v.id === id);
  if (index === -1) throw new Error('VATS not found');
  const existing = mockVats[index]!;
  const updated: Vats = {
    id: existing.id,
    name: existing.name,
    status: 'active',
    server: 'asterisk-01', //assign default server
    port: data.sipPort,
    createdAt: existing.createdAt,
  };
  mockVats[index] = updated;
  return updated;
}

export async function deleteVats(id: number): Promise<void> {
  mockVats = mockVats.filter(v => v.id !== id);
}

export async function getVatsById(id: number): Promise<Vats> {
  const vat = mockVats.find(v => v.id === id);
  if (!vat) throw new Error('VATS not found');
  return { ...vat };
}

export async function updateVats(id: number, data: Partial<Vats>): Promise<Vats> {
  const index = mockVats.findIndex(v => v.id === id);
  if (index === -1) throw new Error('VATS not found');
  const existing = mockVats[index]!;
  const updated: Vats = {
    id: existing.id,
    name: data.name ?? existing.name,
    status: data.status ?? existing.status,
    server: data.server ?? existing.server,
    port: data.port ?? existing.port,
    createdAt: existing.createdAt,
  };
  mockVats[index] = updated;
  return updated;
}
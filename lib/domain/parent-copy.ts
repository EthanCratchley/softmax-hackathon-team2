import type { MissingField } from './types';

const missingFieldLabels: Record<MissingField, string> = {
  parent: 'a linked parent account',
  emergencyContacts: 'two emergency contacts',
  allergies: 'allergies',
  conditions: 'medical conditions',
  medications: 'medications',
  pickupAdult: 'an adult allowed to pick up',
  consent: 'your consent',
  mailingAddress: 'a mailing address',
};

const parentPageOrder: MissingField[] = [
  'allergies', 'conditions', 'medications', 'emergencyContacts',
  'pickupAdult', 'consent', 'mailingAddress', 'parent',
];

export function describeMissingFields(fields: MissingField[]): string[] {
  return parentPageOrder.filter((field) => fields.includes(field)).map((field) => missingFieldLabels[field]);
}

export function formatMissingFields(fields: MissingField[]): string {
  const labels = describeMissingFields(fields);
  if (labels.length < 2) return labels[0] ?? '';
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`;
}

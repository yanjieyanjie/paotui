export interface AddressItem {
  id: string;
  school: string;
  receiverName: string;
  receiverPhone: string;
  dormitory: string;
  room: string;
  detail: string;
  isDefault: boolean;
}

export type DisplayAddress = AddressItem & { addressText: string };

export const ADDRESS_STORAGE_KEY = 'xypt_addresses';

export function loadAddressesFromStorage(): AddressItem[] {
  try {
    const raw = wx.getStorageSync(ADDRESS_STORAGE_KEY);
    return Array.isArray(raw) ? (raw as AddressItem[]) : [];
  } catch {
    return [];
  }
}

export function decorateAddress(item: AddressItem): DisplayAddress {
  const parts: string[] = [];
  if (item.school) parts.push(item.school);
  if (item.dormitory) parts.push(item.dormitory);
  if (item.room) parts.push(item.room);
  if (item.detail) parts.push(item.detail);
  return Object.assign({}, item, { addressText: parts.join(' ') });
}

export function loadDefaultAddress(): DisplayAddress | null {
  const list = loadAddressesFromStorage().map(decorateAddress);
  return list.find((a) => a.isDefault) || list[0] || null;
}
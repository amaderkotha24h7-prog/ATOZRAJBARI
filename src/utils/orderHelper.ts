import {
  WHATSAPP_NUMBER,
  IMO_NUMBER,
  FACEBOOK_PAGE,
  STORE_NAME,
  CURRENCY_SYMBOL,
} from '../config/storeConfig';
import { CartItem, CustomerDetails, OrderRecord } from '../types';

/**
 * Format order text cleanly matching the exact specification:
 * 
 * Hello ATOZ RAJBARI, I want to order:
 * 1) Reflective Safety Vest
 *    Size: L | Colour: GREEN | Qty: 2 | Price: ৳20 each
 * Total: ৳40
 * Name: ... Phone: ... Address: ...
 * Product link: https://atozrajbari.blogspot.com/...
 */
export function buildOrderMessage(
  items: CartItem[],
  customerInfo?: CustomerDetails
): string {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const lines: string[] = [];
  lines.push(`Hello ${STORE_NAME}, I want to order:`);

  items.forEach((item, index) => {
    lines.push(`${index + 1}) ${item.name}`);
    const details: string[] = [];
    if (item.size) details.push(`Size: ${item.size}`);
    if (item.colour) details.push(`Colour: ${item.colour}`);
    details.push(`Qty: ${item.quantity}`);
    details.push(`Price: ${CURRENCY_SYMBOL}${item.price} each`);

    lines.push(`   ${details.join(' | ')}`);
  });

  lines.push(`Total: ${CURRENCY_SYMBOL}${total}`);

  // Customer contact info
  const custParts: string[] = [];
  if (customerInfo?.name?.trim()) custParts.push(`Name: ${customerInfo.name.trim()}`);
  if (customerInfo?.phone?.trim()) custParts.push(`Phone: ${customerInfo.phone.trim()}`);
  if (customerInfo?.address?.trim()) custParts.push(`Address: ${customerInfo.address.trim()}`);
  if (customerInfo?.note?.trim()) custParts.push(`Note: ${customerInfo.note.trim()}`);

  if (custParts.length > 0) {
    lines.push(custParts.join(' | '));
  } else {
    lines.push('Name: [Will provide in chat] | Phone: [Will provide in chat]');
  }

  // Include product link(s)
  if (items.length === 1 && items[0].link) {
    lines.push(`Product link: ${items[0].link}`);
  } else if (items.length > 1) {
    lines.push(`Store Catalog: https://atozrajbari.blogspot.com`);
  }

  return lines.join('\n');
}

/**
 * Save order to localStorage order history
 */
export function recordOrderHistory(
  items: CartItem[],
  channel: 'WhatsApp' | 'IMO' | 'Messenger',
  customerInfo?: CustomerDetails,
  rawMessage?: string
): OrderRecord {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const newRecord: OrderRecord = {
    id: 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    date: new Date().toISOString(),
    items: [...items],
    total,
    channel,
    customerInfo,
    rawMessage: rawMessage || buildOrderMessage(items, customerInfo),
  };

  try {
    const existingStr = localStorage.getItem('atoz_order_history');
    const list: OrderRecord[] = existingStr ? JSON.parse(existingStr) : [];
    list.unshift(newRecord);
    localStorage.setItem('atoz_order_history', JSON.stringify(list.slice(0, 30)));
  } catch (err) {
    console.warn('Failed to save order history:', err);
  }

  return newRecord;
}

/**
 * Open WhatsApp with prefilled message
 */
export function sendViaWhatsApp(
  items: CartItem[],
  customerInfo?: CustomerDetails,
  onSuccess?: () => void
): void {
  const message = buildOrderMessage(items, customerInfo);
  recordOrderHistory(items, 'WhatsApp', customerInfo, message);

  const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${cleanNumber}?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
  if (onSuccess) onSuccess();
}

/**
 * Handle Messenger ordering:
 * Copies message to clipboard and opens m.me
 */
export async function sendViaMessenger(
  items: CartItem[],
  customerInfo?: CustomerDetails,
  onNotify?: (msg: string) => void
): Promise<void> {
  const message = buildOrderMessage(items, customerInfo);
  recordOrderHistory(items, 'Messenger', customerInfo, message);

  try {
    await navigator.clipboard.writeText(message);
  } catch {
    // fallback copy
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  if (onNotify) {
    onNotify('Order details copied to clipboard! Paste it into the Messenger chat.');
  }

  setTimeout(() => {
    const page = FACEBOOK_PAGE.replace(/^@/, '');
    window.open(`https://m.me/${page}`, '_blank', 'noopener,noreferrer');
  }, 400);
}

/**
 * Copy IMO message and prepare IMO modal details
 */
export async function prepareImoOrder(
  items: CartItem[],
  customerInfo?: CustomerDetails
): Promise<string> {
  const message = buildOrderMessage(items, customerInfo);
  recordOrderHistory(items, 'IMO', customerInfo, message);

  try {
    await navigator.clipboard.writeText(message);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  return message;
}

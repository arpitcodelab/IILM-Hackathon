import crypto from 'crypto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes ambiguous chars like 0, O, 1, I

export function generateMUPID(): string {
  const bytes = crypto.randomBytes(6);
  let id = 'MB-';
  for (let i = 0; i < 6; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return id;
}


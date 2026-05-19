function generateUsername(fullName, existingUsernames) {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const firstName = parts[0] || 'user';
  const lastName = parts.slice(1).join('') || 'user';

  const existing = new Set(existingUsernames.map((u) => u.toLowerCase()));

  // Try first letter of first name + up to all letters of last name, expanding first name prefix
  for (let fnLen = 1; fnLen <= firstName.length; fnLen++) {
    const fnPart = firstName.slice(0, fnLen);
    const lnPart = lastName.slice(0, 4);
    const candidate = fnPart + lnPart;
    if (!existing.has(candidate)) return candidate;
  }

  // Expand last name letters beyond 4
  for (let lnLen = 5; lnLen <= lastName.length; lnLen++) {
    const fnPart = firstName.slice(0, 1);
    const lnPart = lastName.slice(0, lnLen);
    const candidate = fnPart + lnPart;
    if (!existing.has(candidate)) return candidate;
  }

  // Fallback: full first + full last
  const fallback = firstName + lastName;
  if (!existing.has(fallback)) return fallback;

  // Last resort: add suffix letters from last name
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(97 + i);
    const candidate = firstName + lastName + c;
    if (!existing.has(candidate)) return candidate;
  }

  return firstName + lastName + 'x';
}

module.exports = { generateUsername };

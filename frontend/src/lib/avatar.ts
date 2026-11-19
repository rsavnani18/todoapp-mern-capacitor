const AVATAR_COLORS = [
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#e11d48',
  '#2563eb',
];

export function getAvatarStyle(email: string) {
  const letter = (email.trim()[0] || 'U').toUpperCase();
  const colorIndex = letter.charCodeAt(0) % AVATAR_COLORS.length;
  return {
    letter,
    backgroundColor: AVATAR_COLORS[colorIndex],
  };
}

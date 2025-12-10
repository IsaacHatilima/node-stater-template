export function toTitleCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function normalizeName(name) {
    const cleaned = name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    return toTitleCase(cleaned);
}
export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

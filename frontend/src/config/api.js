/** Backend origin — override with VITE_API_BASE in .env for staging/production */
export const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    'http://localhost:5000';

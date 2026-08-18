/**
 * Contraseñas de demostración en texto plano por usuario mock. Solo existe
 * porque no hay backend real todavía; al conectar autenticación real esto se
 * reemplaza por completo (no reutilizar este patrón fuera de mocks).
 */
export const MOCK_CREDENTIALS: Record<string, string> = {
  "user-super-1": "1234",
  "user-admin-1": "1234",
  "user-guard-1": "1234",
  "user-guard-2": "1234",
};

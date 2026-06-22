import type { AxiosError } from "axios";

/** Extrait un message lisible depuis n'importe quelle erreur Axios ou inconnue. */
export function getErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

  const status = axiosErr?.response?.status;

  if (status === 403) {
    return "Accès refusé. Votre session a peut-être expiré — reconnectez-vous avec un compte administrateur.";
  }

  if (axiosErr?.response?.data?.message) {
    return axiosErr.response.data.message;
  }

  // Premier message de validation Laravel
  const validationErrors = axiosErr?.response?.data?.errors;
  if (validationErrors) {
    const first = Object.values(validationErrors).flat()[0];
    if (first) return first;
  }

  if (error instanceof Error) return error.message;

  return "Une erreur inattendue est survenue.";
}

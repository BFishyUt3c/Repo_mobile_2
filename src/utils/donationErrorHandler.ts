// Error handling utilities for donation operations

export interface DonationError {
  code: string;
  message: string;
  details?: string;
}

export const DonationErrorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  OWNER_ONLY: "OWNER_ONLY",
  ALREADY_REQUESTED: "ALREADY_REQUESTED",
  INVALID_STATUS: "INVALID_STATUS",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;

export const getDonationErrorInfo = (error: any): DonationError => {
  // Handle network errors
  if (!error.response) {
    return {
      code: DonationErrorCodes.NETWORK_ERROR,
      message: "Error de conexión",
      details: "Verifica tu conexión a internet e inténtalo de nuevo.",
    };
  }

  // Handle timeout errors
  if (error.code === "ECONNABORTED") {
    return {
      code: DonationErrorCodes.TIMEOUT,
      message: "Tiempo de espera agotado",
      details: "La solicitud tardó demasiado tiempo. Inténtalo de nuevo.",
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      return {
        code: DonationErrorCodes.UNAUTHORIZED,
        message: "Sesión expirada",
        details: "Por favor inicia sesión nuevamente.",
      };

    case 403:
      // Check for specific donation-related forbidden errors
      if (
        data?.message?.includes("owner") ||
        data?.message?.includes("propietario")
      ) {
        return {
          code: DonationErrorCodes.OWNER_ONLY,
          message: "Solo el propietario puede realizar esta acción",
          details:
            data?.message || "No tienes permisos para modificar esta donación.",
        };
      }

      return {
        code: DonationErrorCodes.FORBIDDEN,
        message: "Acción no permitida",
        details:
          data?.message || "No tienes permisos para realizar esta acción.",
      };

    case 404:
      return {
        code: DonationErrorCodes.NOT_FOUND,
        message: "Donación no encontrada",
        details:
          data?.message || "La donación que buscas no existe o fue eliminada.",
      };

    case 422:
      // Check for specific validation errors
      if (
        data?.message?.includes("already requested") ||
        data?.message?.includes("ya solicitada")
      ) {
        return {
          code: DonationErrorCodes.ALREADY_REQUESTED,
          message: "Donación ya solicitada",
          details: "Ya has solicitado esta donación anteriormente.",
        };
      }

      if (
        data?.message?.includes("status") ||
        data?.message?.includes("estado")
      ) {
        return {
          code: DonationErrorCodes.INVALID_STATUS,
          message: "Estado de donación inválido",
          details:
            data?.message || "La donación no está disponible para esta acción.",
        };
      }

      return {
        code: DonationErrorCodes.VALIDATION_ERROR,
        message: "Datos inválidos",
        details: data?.message || "Los datos enviados no son válidos.",
      };

    case 500:
      return {
        code: DonationErrorCodes.SERVER_ERROR,
        message: "Error del servidor",
        details: "Ocurrió un error interno. Inténtalo más tarde.",
      };

    default:
      return {
        code: DonationErrorCodes.UNKNOWN,
        message: "Error inesperado",
        details: data?.message || error.message || `Error ${status}`,
      };
  }
};

// Helper function to get user-friendly error messages for donations
export const getDonationErrorMessage = (error: any): string => {
  const errorInfo = getDonationErrorInfo(error);
  return `${errorInfo.message}: ${errorInfo.details}`;
};

// Helper function to determine if an error is recoverable
export const isDonationErrorRecoverable = (error: any): boolean => {
  const errorInfo = getDonationErrorInfo(error);
  const recoverableErrors = [
    DonationErrorCodes.NETWORK_ERROR,
    DonationErrorCodes.TIMEOUT,
    DonationErrorCodes.SERVER_ERROR,
  ];

  return recoverableErrors.includes(errorInfo.code as any);
};

// Helper function to get suggested actions for errors
export const getDonationErrorAction = (error: any): string => {
  const errorInfo = getDonationErrorInfo(error);

  switch (errorInfo.code) {
    case DonationErrorCodes.NETWORK_ERROR:
    case DonationErrorCodes.TIMEOUT:
      return "Reintenta la operación";
    case DonationErrorCodes.UNAUTHORIZED:
      return "Inicia sesión";
    case DonationErrorCodes.OWNER_ONLY:
      return "Solo el propietario puede realizar esta acción";
    case DonationErrorCodes.ALREADY_REQUESTED:
      return "Revisa tus solicitudes pendientes";
    case DonationErrorCodes.NOT_FOUND:
      return "Actualiza la página";
    case DonationErrorCodes.VALIDATION_ERROR:
      return "Revisa los datos ingresados";
    case DonationErrorCodes.SERVER_ERROR:
      return "Inténtalo más tarde";
    default:
      return "Contacta al soporte si el problema persiste";
  }
}; 
import Swal from "sweetalert2";

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** "destructive" resalta el botón de confirmar en rojo y pone el foco en cancelar. */
  variant?: "default" | "destructive";
}

/**
 * Reemplazo de `window.confirm()` en toda la app: mismo uso (`await
 * confirmAction(...)` devuelve `true`/`false`), pero como modal de
 * SweetAlert2 estilizado con la paleta de la app en vez del diálogo nativo
 * del navegador. Solo se puede usar desde un client component.
 */
export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const { title, text, confirmText = "Confirmar", cancelText = "Cancelar", variant = "default" } = options;

  const result = await Swal.fire({
    title,
    text,
    icon: variant === "destructive" ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: variant === "destructive",
    buttonsStyling: false,
    customClass: {
      popup: "gv-swal-popup",
      title: "gv-swal-title",
      htmlContainer: "gv-swal-text",
      confirmButton: variant === "destructive" ? "gv-swal-btn gv-swal-btn-destructive" : "gv-swal-btn gv-swal-btn-default",
      cancelButton: "gv-swal-btn gv-swal-btn-cancel",
    },
  });

  return result.isConfirmed;
}

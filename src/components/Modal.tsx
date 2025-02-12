import type React from "react";
import { useEffect, useRef } from "react";

export type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  width?: number;
  hasCloseButton?: boolean;
  isCloseOnOverlayClick?: boolean;
};

const Modal = ({
  children,
  open = false,
  onClose,
  width = 500,
  hasCloseButton = false,
  isCloseOnOverlayClick = true,
}: Props) => {
  const anchorRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.addEventListener("close", onClose);
    }

    return () => {
      if (anchorRef.current) {
        anchorRef.current.removeEventListener("close", onClose);
      }
    };
  }, [onClose]);

  // drag logic
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const modalContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = modalContainerRef.current;

    const handleMouseDown = (event: MouseEvent) => {
      if (dialog && event.target === dialog) {
        isDragging.current = true;
        offset.current = {
          x: event.clientX - dialog.offsetLeft,
          y: event.clientY - dialog.offsetTop,
        };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current && dialog) {
        dialog.style.left = `${event.clientX - offset.current.x}px`;
        dialog.style.top = `${event.clientY - offset.current.y}px`;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    if (dialog) {
      dialog.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (dialog) {
        dialog.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, []);

  return (
    <>
      <dialog className="modal" ref={anchorRef} open={open}>
        <div
          className="modal-box p-10 bg-base-100 max-w-none text-base-content absolute cursor-move"
          style={{ width }}
          ref={modalContainerRef}
        >
          {hasCloseButton && (
            <form method="dialog">
              <button
                type="submit"
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                ✕
              </button>
            </form>
          )}
          <div className="cursor-auto">{children}</div>
        </div>
        {isCloseOnOverlayClick && (
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        )}
      </dialog>
    </>
  );
};

export default Modal;

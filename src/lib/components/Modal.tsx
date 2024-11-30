import type React from "react";
import { useEffect, useRef } from "react";

export type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  width?: number;
};

const Modal = ({ children, open = false, onClose, width = 500 }: Props) => {
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

  return (
    <>
      <dialog className="modal" ref={anchorRef} open={open}>
        <div
          className="modal-box p-10 bg-base-100 max-w-none text-base-content"
          style={{ width }}
        >
          {children}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
};

export default Modal;

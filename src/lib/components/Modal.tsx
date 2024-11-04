import type React from "react";
import { useEffect } from "react";

export type Props = {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLDialogElement>;
  open?: boolean;
  onClose?: () => void;
};

const Modal = ({ children, anchorRef, open = false, onClose }: Props) => {
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.addEventListener("close", onClose);
    }

    return () => {
      if (anchorRef.current) {
        anchorRef.current.removeEventListener("close", onClose);
      }
    };
  }, [anchorRef, onClose]);

  return (
    <>
      <dialog className="modal" ref={anchorRef} open={open}>
        <div className="modal-box p-10 bg-base-100 w-[500px] max-w-none text-base-content">
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

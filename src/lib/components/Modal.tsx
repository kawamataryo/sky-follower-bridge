import React from "react";

export type Props = {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLDialogElement>;
  open?: boolean;
};

const Modal = ({ children, anchorRef, open = false }: Props) => {
  return (
    <>
      <dialog className="modal" ref={anchorRef} open={open}>
        <div className="modal-box p-10 bg-base-100 w-[750px] max-w-none text-base-content">
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

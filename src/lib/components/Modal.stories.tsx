import type { Meta, StoryObj } from "@storybook/react";

import { useRef } from "react";
import Modal from "./Modal";
import type { Props as UserCardProps } from "./UserCard";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
};
export default meta;

type Story = StoryObj<{ items: UserCardProps["user"][] }>;

const DefaultTemplate: Story = {
  render: () => {
    const modalRef = useRef<HTMLDialogElement>(null);

    return (
      <>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => modalRef.current?.showModal()}
        >
          open
        </button>
        <Modal anchorRef={modalRef}>
          <p>Modal content</p>
        </Modal>
      </>
    );
  },
};

export const Default = {
  ...DefaultTemplate,
};

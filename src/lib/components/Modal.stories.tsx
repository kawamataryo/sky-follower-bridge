import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Modal from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

const DefaultTemplate: Story = {
  render: () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          open
        </button>
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <p>Modal content</p>
        </Modal>
      </>
    );
  },
};

export const Default = {
  ...DefaultTemplate,
};

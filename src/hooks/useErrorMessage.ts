import { useState } from "react";

export interface ErrorMessage {
  message: string;
  documentLink?: string;
}

export const useErrorMessage = () => {
  const [errorMessage, setErrorMessageState] = useState<ErrorMessage | null>(
    null,
  );

  const setErrorMessage = (message: string, documentLink?: string) => {
    setErrorMessageState({ message, documentLink });
  };

  const clearErrorMessage = () => {
    setErrorMessageState(null);
  };

  return {
    errorMessage,
    setErrorMessage,
    clearErrorMessage,
  };
};

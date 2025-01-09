import { useEffect } from "react";
import packageJson from "../package.json";

import "./style.css";

import { ErrorMessage } from "~components/popup/ErrorMessage";
import { Header } from "~components/popup/Header";
import { LoginForm } from "~components/popup/LoginForm";
import { MESSAGE_TYPE } from "~lib/constants";
import { useLoginForm } from "~lib/hooks/useLoginForm";

function IndexPopup() {
  const {
    isLoading,
    password,
    setPassword,
    identifier,
    setIdentifier,
    authFactorToken,
    setAuthFactorToken,
    isShowAuthFactorTokenInput,
    message,
    searchBskyUser,
    loadCredentialsFromStorage,
  } = useLoginForm();

  const isShowErrorMessage = message?.type === MESSAGE_TYPE.ERROR;

  useEffect(() => {
    loadCredentialsFromStorage();
  }, [loadCredentialsFromStorage]);

  return (
    <div className="px-5 pt-3 pb-4 w-[380px]">
      <Header version={packageJson.version} />
      <LoginForm
        isLoading={isLoading}
        password={password}
        setPassword={setPassword}
        identifier={identifier}
        setIdentifier={setIdentifier}
        authFactorToken={authFactorToken}
        setAuthFactorToken={setAuthFactorToken}
        isShowAuthFactorTokenInput={isShowAuthFactorTokenInput}
        onSubmit={searchBskyUser}
      />
      {isShowErrorMessage && message && (
        <ErrorMessage
          message={message.message}
          documentLink={message.documentLink}
        />
      )}
    </div>
  );
}

export default IndexPopup;

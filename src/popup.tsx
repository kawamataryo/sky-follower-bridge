import { useEffect } from "react";
import packageJson from "../package.json";

import "./style.css";

import { AuthForm } from "~components/popup/AuthForm";
import { ErrorMessage } from "~components/popup/ErrorMessage";
import { Header } from "~components/popup/Header";
import { SearchForm } from "~components/popup/SearchForm";
import { MESSAGE_TYPE } from "~lib/constants";
import { useAuth } from "~lib/hooks/useAuth";
import { useSearch } from "~lib/hooks/useSearch";

function IndexPopup() {
  const {
    isLoading: isAuthLoading,
    password,
    setPassword,
    identifier,
    setIdentifier,
    authFactorToken,
    setAuthFactorToken,
    isShowAuthFactorTokenInput,
    message: authMessage,
    isAuthenticated,
    isAuthenticatedLoading,
    login,
    logout,
    displayName,
    avatar,
  } = useAuth();

  const {
    isLoading: isSearchLoading,
    message: searchMessage,
    searchBskyUser,
  } = useSearch();

  const message = authMessage || searchMessage;
  const isShowErrorMessage = message?.type === MESSAGE_TYPE.ERROR;

  return (
    <div className="px-5 pt-3 pb-4 w-[380px]">
      <Header version={packageJson.version} />
      {isAuthenticatedLoading ? (
        <div className="flex justify-center items-center mt-5">
          <span className="loading loading-spinner loading-sm" />
        </div>
      ) : !isAuthenticated ? (
        <AuthForm
          isLoading={isAuthLoading}
          password={password}
          setPassword={setPassword}
          identifier={identifier}
          setIdentifier={setIdentifier}
          authFactorToken={authFactorToken}
          setAuthFactorToken={setAuthFactorToken}
          isShowAuthFactorTokenInput={isShowAuthFactorTokenInput}
          onSubmit={login}
        />
      ) : (
        <SearchForm
          isLoading={isSearchLoading}
          displayName={displayName}
          avatar={avatar}
          onSubmit={searchBskyUser}
          onLogout={logout}
        />
      )}
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

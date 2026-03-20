import { useEffect, useState } from "react";

export type AppLanguage = "en" | "tl";

const LANGUAGE_KEY = "appLanguage";
const LANGUAGE_EVENT = "app-language-change";

export const getAppLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(LANGUAGE_KEY);
  return saved === "tl" ? "tl" : "en";
};

export const setAppLanguage = (language: AppLanguage) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: language }));
};

export const useAppLanguage = () => {
  const [language, setLanguageState] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const syncLanguage = () => setLanguageState(getAppLanguage());
    window.addEventListener("storage", syncLanguage);
    window.addEventListener(LANGUAGE_EVENT, syncLanguage as EventListener);

    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener(LANGUAGE_EVENT, syncLanguage as EventListener);
    };
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setAppLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  return { language, setLanguage };
};

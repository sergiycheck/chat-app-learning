import { useEffect } from "react";

export const useBeforeUnload = (value: any) => {
  useEffect(() => {
    function handleBeforeunload(e: BeforeUnloadEvent) {
      let returnValue;
      if (typeof value === "function") {
        returnValue = value(e);
      } else {
        returnValue = value;
      }
      if (returnValue) {
        e.preventDefault();
        e.returnValue = returnValue;
      }

      return returnValue;
    }

    window.addEventListener("beforeunload", handleBeforeunload);
    return () => window.removeEventListener("beforeunload", handleBeforeunload);
  }, [value]);
};

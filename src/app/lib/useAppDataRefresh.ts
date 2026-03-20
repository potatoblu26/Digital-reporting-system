import { useEffect, useState } from "react";
import { subscribeToDataUpdates } from "./mockData";

export const useAppDataRefresh = () => {
  const [, setVersion] = useState(0);

  useEffect(() => {
    return subscribeToDataUpdates(() => {
      setVersion((value) => value + 1);
    });
  }, []);
};

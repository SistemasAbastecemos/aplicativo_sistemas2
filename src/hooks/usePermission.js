import { useState, useEffect } from "react";
import { useEmpresa } from "../contexts/EmpresaContext";
import { apiService } from "../services/api";

export const usePermission = (ruta) => {
  const { empresa } = useEmpresa();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!ruta || !empresa) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiService.verifyMenuAccess({
          ruta: ruta,
          empresa,
        });

        setHasAccess(res.success);
        setError(res.success ? null : res.message);
      } catch (err) {
        setHasAccess(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [ruta, empresa]);

  return { hasAccess, loading, error };
};

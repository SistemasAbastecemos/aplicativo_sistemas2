import { useEffect, useState, useRef, useCallback } from "react";
import { apiService } from "../../../services/api";

/**
 * Consulta periodicamente el estado del servicio de base de datos CentOS
 * a traves del tunel Cloudflared + LanClient.
 *
 * Devuelve:
 *   status: 'online' | 'degraded' | 'offline' | 'checking'
 *   latencyMs, lastCheck, error, refresh()
 */
export const useDatabaseStatus = ({
  intervalMs = 30000,
  enabled = true,
} = {}) => {
  const [status, setStatus] = useState("checking");
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const verificar = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus((prev) => (prev === "checking" ? "checking" : prev));
    setError(null);

    try {
      const data = await apiService.verificarEstadoBaseDatos({
        signal: controller.signal,
      });
      setStatus(data.status || "offline");
      setLatencyMs(
        typeof data.latency_ms === "number" ? data.latency_ms : null,
      );
      setLastCheck(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("offline");
      setLatencyMs(null);
      setLastCheck(new Date());
      setError(err.message || "Sin respuesta del servicio");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    verificar();
    timerRef.current = setInterval(verificar, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, intervalMs, verificar]);

  return { status, latencyMs, lastCheck, error, refresh: verificar };
};

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

export const useVisitFormDraft = (sedeId) => {
  const { guardarDraft, limpiarDraft, obtenerDraft } = useStore();
  const [draft, setDraft] = useState(null);

  const DRAFT_KEY = `gv_draft_sede_${sedeId}`;

  // Recuperar draft al montar
  useEffect(() => {
    const savedDraft = obtenerDraft(DRAFT_KEY);
    if (savedDraft) {
      setDraft(savedDraft);
    }
  }, [sedeId, obtenerDraft]);

  // Persistir cambios
  const persistirDraft = useCallback((formData) => {
    setDraft(formData);
    guardarDraft(DRAFT_KEY, formData);
  }, [guardarDraft, DRAFT_KEY]);

  // Limpiar draft
  const limpiarDraftLocal = useCallback(() => {
    setDraft(null);
    limpiarDraft(DRAFT_KEY);
  }, [limpiarDraft, DRAFT_KEY]);

  // Auto-save cada 5 segundos
  useEffect(() => {
    if (!draft) return;

    const autoSave = setInterval(() => {
      guardarDraft(DRAFT_KEY, draft);
    }, 5000);

    return () => clearInterval(autoSave);
  }, [draft, guardarDraft, DRAFT_KEY]);

  return {
    draft,
    persistirDraft,
    limpiarDraft: limpiarDraftLocal,
    hasDraft: !!draft
  };
};
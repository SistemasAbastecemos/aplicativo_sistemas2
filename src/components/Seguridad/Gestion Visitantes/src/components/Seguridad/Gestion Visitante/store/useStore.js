import { create }from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Estado de la sede
      sede: null,
      setSede: (sede) => set({ sede }),
      
      // Cola de sincronización
      sincronizacion: {
        pendientes: 0,
        registros: []
      },
      
      // Agregar a cola de sincronización
      agregarPendiente: (registro) => set((state) => ({
        sincronizacion: {
          pendientes: state.sincronizacion.pendientes + 1,
          registros: [...state.sincronizacion.registros, registro]
        }
      })),
      
      // Limpiar pendientes
      limpiarPendientes: () => set({
        sincronizacion: { pendientes: 0, registros: [] }
      }),
      
      // Manejo de drafts
      drafts: {},
      guardarDraft: (key, data) => set((state) => ({
        drafts: { ...state.drafts, [key]: data }
      })),
      
      obtenerDraft: (key) => get().drafts[key] || null,
      
      limpiarDraft: (key) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[key];
        return { drafts: newDrafts };
      }),
      
      // Estado de conexión
      conexion: {
        online: true,
        lastSync: null
      },
      
      setOnline: (online) => set((state) => ({
        conexion: { ...state.conexion, online }
      })),
      
      // Sincronización
      sincronizar: async () => {
        const { sincronizacion } = get();
        
        if (sincronizacion.pendientes === 0) return;
        
        try {
          const response = await fetch('/api/sincronizar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sincronizacion.registros)
          });
          
          if (response.ok) {
            set({
              sincronizacion: { pendientes: 0, registros: [] },
              conexion: { online: true, lastSync: new Date().toISOString() }
            });
          }
        } catch (error) {
          console.error('Error sincronizando:', error);
        }
      }
    }),
    {
      name: 'gestion-visitante-storage',
      partialize: (state) => ({
        sede: state.sede,
        sincronizacion: state.sincronizacion,
        drafts: state.drafts
      })
    }
  )
);
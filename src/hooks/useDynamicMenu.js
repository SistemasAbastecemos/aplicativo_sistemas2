import { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { roleService } from '../services/roleService';
import { useAuth } from '../contexts/AuthContext'; // ✅ Importar useAuth

export const useDynamicMenu = () => {
  const [menu, setMenu] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [acciones, setAcciones] = useState({ accionesRapidas: [], funcionalidadesEspeciales: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth(); // ✅ Obtener usuario autenticado

  const tienePermiso = (id_menu, accion) => {
    if (!menu || !Array.isArray(menu)) return false;
    
    const menuItem = menu.find(item => item.id_menu === id_menu);
    return menuItem && menuItem.permisos && menuItem.permisos[accion] === true;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      // ✅ Solo cargar si tenemos un usuario autenticado
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ Usar el ID real del usuario autenticado
        const result = await menuService.getMenuPorUsuario(user.id);
        
        console.log("Resultado de menuService:", result); // Para debugging
        
        const menuData = Array.isArray(result.menu) ? result.menu : [];
        const userData = result.userInfo || {};
        
        setMenu(menuData);
        setUserInfo(userData);

        // ✅ Solo llamar a roleService si tenemos los datos necesarios
        if (userData.id && userData.id_rol) {
          try {
            const accionesData = await roleService.getAccionesPorUsuario(
              userData.id,
              userData.id_rol,
              userData.id_cargo || null
            );
            setAcciones(accionesData);
          } catch (roleError) {
            console.warn('Error cargando acciones:', roleError);
            setAcciones(roleService.getAccionesPorDefecto(userData.id_rol));
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
        setMenu([]);
        setUserInfo(null);
        setAcciones({ accionesRapidas: [], funcionalidadesEspeciales: [] });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]); // ✅ Dependencia de user

  return { 
    menu, 
    userInfo, 
    acciones, 
    loading, 
    error,
    tienePermiso 
  };
};
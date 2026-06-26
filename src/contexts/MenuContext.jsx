import React, { createContext, useContext } from "react";
import { useDynamicMenu } from "../hooks/useDynamicMenu";

/**
 * MenuContext
 * -----------
 * Carga el arbol de menus/permisos del usuario UNA SOLA VEZ y lo comparte
 * con toda la app. Evita que cada componente que necesite permisos vuelva a
 * pedir get_menu_user.php por su cuenta.
 *
 * IMPORTANTE: debe montarse DENTRO de <AuthProvider>, porque useDynamicMenu
 * depende del usuario autenticado.
 */
const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const valor = useDynamicMenu();
  return <MenuContext.Provider value={valor}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu debe ser usado dentro de un MenuProvider");
  }
  return ctx;
};

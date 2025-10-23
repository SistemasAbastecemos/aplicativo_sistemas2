import React from 'react';
import { useDynamicMenu } from '../../hooks/useDynamicMenu';

const PermissionButton = ({ 
  menuId, 
  action, 
  children, 
  onClick, 
  ...props 
}) => {
  const { tienePermiso } = useDynamicMenu();
  
  if (!tienePermiso(menuId, action)) {
    return null; // No renderizar si no tiene permiso
  }

  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default PermissionButton;
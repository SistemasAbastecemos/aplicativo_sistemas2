import React from 'react';

const Header = ({ sede, usuario }) => {
  return (
    <div className="header">
      <h1> Gestión de Visitantes</h1>
      <div className="header-info">
        <span className="badge sede">Sede: {sede}</span>
        <span className="badge usuario">Operador: {usuario}</span>
      </div>
    </div>
  );
};

export default Header;
import React from 'react';

const StatusBadge = ({ online, pendientes }) => {
  return (
    <div className="status-badge">
      <div className={`status-indicator ${online ? 'online' : 'offline'}`}>
        {online ? 'En línea' : ' Offline'}
      </div>
      {pendientes > 0 && (
        <div className="sync-pending">
          ⚡ {pendientes} pendientes
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
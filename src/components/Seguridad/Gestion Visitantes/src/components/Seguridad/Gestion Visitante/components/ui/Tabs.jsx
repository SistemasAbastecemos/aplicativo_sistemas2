import React from 'react';
import './Tabs.css';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="tabs-navigation-wrapper">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button" /* Evita que se comporte como submit si está en un form */
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
          {tab.badge && <span className="tab-badge">{tab.badge}</span>}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
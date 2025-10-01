import React from 'react';
import styles from './LoadingScreen.module.css';

const LoadingScreen = ({ message = "Cargando..." }) => {
    return (
        <div className={styles.loadingScreen}>
            <div className={styles.spinner}></div>
            <h2 className={styles.loadingText}>{message}</h2>
        </div>
    );
};

export default LoadingScreen;
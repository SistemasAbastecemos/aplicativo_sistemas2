import { useState, useCallback } from 'react';

export const useScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);

  const startScanner = useCallback((onSuccess) => {
    // Para móvil, usar API del navegador o librería como Quagga
    if (typeof window === 'undefined') return;

    // Detectar si es móvil y tiene cámara
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && 'mediaDevices' in navigator) {
      setIsScanning(true);
      
      // Configurar escáner (simplificado - en producción usar Quagga/ZXing)
      const video = document.createElement('video');
      video.style.width = '100%';
      video.style.height = '100%';
      
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      }).then(stream => {
        video.srcObject = stream;
        video.play();
        
        // Aquí integrarías QuaggaJS o similar
        // Por ahora es un mock
        const mockScanner = {
          video,
          stream,
          stop: () => {
            stream.getTracks().forEach(track => track.stop());
            setIsScanning(false);
          }
        };
        
        setScanner(mockScanner);
        
        // Simular escaneo exitoso después de 3 segundos
        setTimeout(() => {
          if (onSuccess) {
            onSuccess('1234567890');
            mockScanner.stop();
          }
        }, 3000);
        
      }).catch(err => {
        console.error('Error accediendo a la cámara:', err);
        setIsScanning(false);
      });
    } else {
      // En desktop, simular entrada de teclado (como lector de códigos de barras USB)
      let barcodeBuffer = '';
      let lastKeyTime = Date.now();
      
      const handleKeyPress = (e) => {
        const now = Date.now();
        
        // Si han pasado más de 100ms desde la última tecla, reiniciar buffer
        if (now - lastKeyTime > 100) {
          barcodeBuffer = '';
        }
        
        lastKeyTime = now;
        
        // Si es Enter, procesar el código
        if (e.key === 'Enter') {
          if (barcodeBuffer.length >= 8) {
            onSuccess(barcodeBuffer);
          }
          barcodeBuffer = '';
          e.preventDefault();
        } else if (e.key.length === 1) {
          // Acumular caracteres
          barcodeBuffer += e.key;
        }
      };
      
      document.addEventListener('keypress', handleKeyPress);
      setIsScanning(true);
      
      setScanner({
        stop: () => {
          document.removeEventListener('keypress', handleKeyPress);
          setIsScanning(false);
        }
      });
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scanner && scanner.stop) {
      scanner.stop();
    }
    setIsScanning(false);
    setScanner(null);
  }, [scanner]);

  return {
    startScanner,
    stopScanner,
    isScanning,
    scanner
  };
};
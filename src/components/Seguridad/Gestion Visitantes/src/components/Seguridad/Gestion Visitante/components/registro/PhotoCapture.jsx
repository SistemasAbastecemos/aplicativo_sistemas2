import React, { useState, useRef } from 'react';

const PhotoCapture = ({ onCapture, initialPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(initialPhoto);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('No se puede acceder a la cámara');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Configurar canvas al tamaño del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el fotograma actual
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a base64 con compresión
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      setPhoto(imageData);
      onCapture(imageData);

      // Detener cámara
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="photo-capture">
      {!photo ? (
        <>
          {!stream ? (
            <button
              type="button"
              className="btn-camera"
              onClick={startCamera}
            >
               Tomar Foto
            </button>
          ) : (
            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="camera-controls">
                <button
                  type="button"
                  className="btn-capture"
                  onClick={capturePhoto}
                >
                  Capturar
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={stopCamera}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="photo-preview">
          <img src={photo} alt="Foto capturada" />
          <button
            type="button"
            className="btn-retake"
            onClick={() => {
              setPhoto(null);
              onCapture(null);
            }}
          >
             Tomar otra
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
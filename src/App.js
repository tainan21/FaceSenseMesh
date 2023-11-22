import { useRef, useEffect } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh, calculateDistance } from './drawing_utilities';

function App() {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof cameraRef.current !== 'undefined' &&
      cameraRef.current !== null &&
      cameraRef.current.video.readyState === 4
    ) {
      const video = cameraRef.current.video;
      const videoHeight = cameraRef.current.video.videoHeight;
      const videoWidth = cameraRef.current.video.videoWidth;

      video.width = videoWidth;
      video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces(video);

      const ctx = canvasRef.current.getContext('2d');
      drawMesh(face, ctx);

      // Verifique se há pelo menos um rosto detectado
      if (face.length > 0) {
        // Pegue os pontos dos olhos (por exemplo, índice 159 e 386)
        const leftEye = face[0].scaledMesh[159];
        const rightEye = face[0].scaledMesh[386];

        // Calcule a distância entre os olhos
        const distanceBetweenEyes = calculateDistance(leftEye, rightEye);

        // Imprima a distância no console
        console.log('Distância entre os olhos:', distanceBetweenEyes);
      }
    }
  };

  useEffect(() => {
    runFacemesh();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={cameraRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            width: 640,
            height: 480,
            zIndex: 9,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            width: 640,
            height: 480,
            zIndex: 9,
          }}
        />
        <h3 className="text">Face Mesh App</h3>
      </header>
    </div>
  );
}

export default App;

import React, { useRef } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 224,
  height: 224,
  facingMode: "environment"
};

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Webcam
        audio={false}
        height={224}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={224}
        videoConstraints={videoConstraints}
      />

      <br />

      <button onClick={capture} style={{ marginTop: "10px" }}>
        Capture Image
      </button>
    </div>
  );
};

export default CameraCapture;
import React, { useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import animationData from "../../assets/animation.json";

const LottieTest = () => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    lottieRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    lottieRef.current?.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    lottieRef.current?.stop();
    setIsPlaying(false);
  };

  const handleGoToHalf = () => {
    // Go to 50% progress and pause
    lottieRef.current?.goToAndStop(0.5, true);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Lottie Animation Test</h1>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={true}
          autoplay={false}
          style={{ width: 300, height: 300 }}
        />

        <div className="flex gap-2 mt-4">
          <button 
            onClick={handlePlay} 
            disabled={isPlaying}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ▶ Play
          </button>
          <button 
            onClick={handlePause} 
            disabled={!isPlaying}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ⏸ Pause
          </button>
          <button 
            onClick={handleStop}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            ⏹ Stop
          </button>
          <button 
            onClick={handleGoToHalf}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            ➡ Go to Half
          </button>
        </div>
      </div>
    </div>
  );
};

export default LottieTest; 
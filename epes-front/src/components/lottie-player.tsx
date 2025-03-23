// src/components/lottie-player.tsx
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottiePlayerProps {
  animation: any;
  width?: string | number;
  height?: string | number;
}

export default function LottiePlayer({
  animation,
  width = "auto",
  height = "auto",
}: LottiePlayerProps) {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <Lottie
        animationData={animation}
        className="flex justify-center items-center"
        loop={true}
        style={{ width, height }}
      />
    </div>
  );
}

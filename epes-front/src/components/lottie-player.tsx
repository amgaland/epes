import Lottie from "lottie-react";

export default function LottiePlayer({
  animation,
  width = "auto",
  height = "auto",
}: any) {
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

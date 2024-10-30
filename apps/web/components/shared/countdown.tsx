import { useEffect, useState } from "react";

type CountdownProps = {
  initialTime: number;
  onEnd: () => void;
};

export function Countdown({ initialTime, onEnd }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onEnd]);

  const displayFormattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="countdown">
      <p className="time-display">{displayFormattedTime()}</p>
      {/* <Button onClick={() => setTimeLeft(initialTime)}>Reset</Button> */}
    </div>
  );
}
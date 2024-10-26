import { useEffect, useState } from "react";

type CountdownProps = {
  initialTime: number;
  onEnd: () => void;
  formatTime?: (time: number) => string;
};

export function Countdown({ initialTime, onEnd, formatTime }: CountdownProps) {
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

  const displayTime = formatTime ? formatTime(timeLeft) : timeLeft;

  return (
    <div className="countdown">
      <p className="time-display">00:{displayTime}</p>
      {/* <Button onClick={() => setTimeLeft(initialTime)}>Reset</Button> */}
    </div>
  );
}
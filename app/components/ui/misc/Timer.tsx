import { useEffect, useState } from "react";

const Timer = () => {
    const [milliseconds, setMilliseconds] = useState(0.0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setMilliseconds((prevMilliseconds) => (prevMilliseconds + 1));
      }, 10);
  
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="flex">
        <p>{milliseconds/100}</p><p className="ml-auto">s</p>
      </div>
    );
  };
  
export default Timer;
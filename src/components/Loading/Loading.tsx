import React from "react";
import "./Loading.scss";

interface LoadingProps {
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = "Loading...", className = "" }) => {
  return (
    <div className={`loading-overlay ${className}`}>
      <div className="spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;

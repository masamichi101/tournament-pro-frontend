import React from "react";
import "../../../public/assets/css/loadingModal.css";


interface LoadingModalProps {
  show: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>処理中です...</p>
      </div>
    </div>
  );
};

export default LoadingModal;

import React from "react";
import "../../../public/assets/css/modal.css";

interface ConfirmationModalProps {
  isOpen: boolean; // モーダルが表示されているかどうか
  title: string; // モーダルのタイトル
  message: string; // モーダルのメッセージ
  onConfirm: () => void; // 「確認」ボタンのクリック時のコールバック
  onCancel: () => void; // 「キャンセル」ボタンのクリック時のコールバック
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null; // モーダルが閉じている場合は何もレンダリングしない

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5>{title}</h5>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onConfirm}>
            確認
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

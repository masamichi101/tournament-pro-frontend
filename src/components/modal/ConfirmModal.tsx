"use client";

import React from "react";
import { Modal } from "react-bootstrap";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ show, title, message, onConfirm, onCancel }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-danger" onClick={onConfirm}>
          承諾する
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          承諾しない
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;

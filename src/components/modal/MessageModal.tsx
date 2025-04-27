"use client";

import React from "react";
import { Modal } from "react-bootstrap";

interface MessageModalProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ show, title, message, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessageModal;

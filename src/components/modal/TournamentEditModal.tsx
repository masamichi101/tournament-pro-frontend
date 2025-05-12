"use client";

import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Tournament } from "../TournamentCategoryList";


interface TournamentEditModalProps {
  show: boolean;
  onClose: () => void;
  tournament: Tournament;
  onSave: (updated: Partial<Omit<Tournament, "uid" | "createdAt">>) => void;
}

const TournamentEditModal: React.FC<TournamentEditModalProps> = ({
  show,
  onClose,
  tournament,
  onSave,
}) => {
  const [form, setForm] = useState({ ...tournament });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { uid, image, ...rest } = form as Tournament;
    onSave(rest); // ✅ imageを除いて送信
    onClose();
  };


  const renderField = (
    label: string,
    name: keyof Tournament,
    type: string = "text"
  ) => (
    <div className="mb-3 d-flex align-items-center justify-content-between">
      <div className="flex-grow-1">
        <label className="form-label mb-1">{label}</label>
        <input
          type={type}
          className="form-control"
          name={name}
          value={typeof form[name] === "string" || typeof form[name] === "number" ? form[name] : ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderMatCountField = () => (
    <div className="mb-3">
      <label className="form-label mb-1">畳数</label>
      <select
        className="form-select"
        name="mat_count"
        value={form.mat_count}
        onChange={handleChange}
      >
        {[...Array(10)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}面
          </option>
        ))}
      </select>
    </div>
  );


  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>トーナメント情報の編集</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderField("大会名", "name")}
        {renderField("都道府県", "prefecture")}
        {renderField("会場", "venue")}
        {renderField("開始日", "start_date", "date")}
        {renderField("終了日", "end_date", "date")}
        {renderMatCountField()}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          キャンセル
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          保存
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default TournamentEditModal;

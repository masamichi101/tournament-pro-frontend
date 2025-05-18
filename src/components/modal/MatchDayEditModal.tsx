// MatchDayEditModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

interface MatchDayEditModalProps {
  show: boolean;
  matchDay: string | null;
  tournamentStart: string;
  tournamentEnd: string | null;
  onClose: () => void;
  onSave: (newMatchDay: string) => void;
}

const MatchDayEditModal: React.FC<MatchDayEditModalProps> = ({
  show,
  matchDay,
  tournamentStart,
  tournamentEnd,
  onClose,
  onSave,
}) => {
  const [newDate, setNewDate] = useState(matchDay || "");
  const [dateOptions, setDateOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!tournamentStart) return;
    const start = new Date(tournamentStart);
    const end = tournamentEnd ? new Date(tournamentEnd) : new Date(tournamentStart);

    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    setDateOptions(dates);
  }, [tournamentStart, tournamentEnd]);

  const handleSave = () => {

    if (newDate) {
      onSave(newDate);
    }
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>試合日を変更</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label className="form-label">新しい試合日</label>
        <select
          className="form-select"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        >
          <option value="">選択してください</option>
          {dateOptions.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          キャンセル
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          保存
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default MatchDayEditModal;

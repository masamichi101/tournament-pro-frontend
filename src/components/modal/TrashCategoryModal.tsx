"use client";

import React from "react";
import { Modal } from "react-bootstrap";

interface TournamentCategory {
  uid: string;
  match_type: string;
  gender: string;
  weight: string;
  name: string;

  match_day?: string | null;
  is_deleted: boolean;
}


interface TrashCategoryModalProps {
  show: boolean;
  onClose: () => void;
  deletedCategories: TournamentCategory[];
  loading: boolean;
  onRestore: (category: TournamentCategory) => void;
  onPermanentDelete: (category: TournamentCategory) => void;
}

const TrashCategoryModal: React.FC<TrashCategoryModalProps> = ({
  show,
  onClose,
  deletedCategories,
  loading,
  onRestore,
  onPermanentDelete,
}) => {

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>ゴミ箱内のカテゴリー一覧</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>読み込み中...</p>
        ) : deletedCategories.length === 0 ? (
          <p>ゴミ箱にはカテゴリーがありません。</p>
        ) : (
          <ul className="list-group">
            {deletedCategories.map((category) => (
              <li
                key={category.uid}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {category.match_type} {category.gender} {category.weight}{" "}
                  {category.name}
                </span>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => onRestore(category)}
                  >
                    復元
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onPermanentDelete(category)} // これは props で渡された関数
                  >
                    完全削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          閉じる
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default TrashCategoryModal;


"use client";

import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";
import "../../../public/assets/css/playerModal.css";

interface PlayerModalProps {
  players: any[];
  selectedPlayers: any[]; // 選択済みプレイヤー
  onSelect: (player: any) => void; // プレイヤー選択時のコールバック
  onClose: () => void; // モーダルを閉じる
}

const PlayerModal: React.FC<PlayerModalProps> = ({
  players,
  selectedPlayers,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPlayers = players
    .filter((player) => !selectedPlayers.some((selected) => selected.id === player.id)) // 選択済みを除外
    .filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) // 検索フィルタ
    );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">プレイヤーを選択</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 検索フォーム */}
        <div className="search-bar">
          <input
            type="text"
            className="player-search-input"
            placeholder="🔍　選手名を検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* プレイヤーリスト */}
        <ul className="player-list">
          {/* 空白の選択肢 */}
          <li
            onClick={() => {
              onSelect(null); // 空白を選択した場合
              onClose(); // モーダルを閉じる
            }}
            className="player-item empty-option"
          >
            空白を選択
          </li>
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              onClick={() => {
                onSelect(player); // プレイヤー選択
                onClose(); // モーダルを閉じる
              }}
              className="player-item"
            >
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="player-dojo">【{player.dojo}】</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerModal;

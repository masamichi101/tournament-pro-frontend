"use client";

import React, { useEffect, useState } from "react";
import "../../../public/assets/css/playerModal.css";
import { getMatchesAll } from "@/action/tournament";

interface LoserPlayersModalProps {
  selectedThirdPlayers: any[]; // 選択済みプレイヤー
  onSelect: (player: any) => void; // プレイヤー選択時のコールバック
  onClose: () => void; // モーダルを閉じる
  honsenStepladderUid: string; // 本戦ステップラダーのUID
}

const LoserPlayersModal: React.FC<LoserPlayersModalProps> = ({
  selectedThirdPlayers,
  onSelect,
  onClose,
  honsenStepladderUid
}) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true); // ローディング開始
      try {
        const response = await getMatchesAll({ stepLadderUid: honsenStepladderUid });

        if (response.success) {
          setMatches(response.matches); // ✅ 試合データを `matches` に保存

        } else {
          console.error("試合データの取得に失敗しました");
        }
      } catch (error) {
        console.error("試合データの取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false); // ローディング終了
      }
    };

    if (honsenStepladderUid) {
      fetchMatches();
    }
  }, [honsenStepladderUid]);

  // selectedThirdPlayers の level と match_number の組み合わせをセットとして保持
  const selectedSet = new Set(
    selectedThirdPlayers.map(player => `${player.level}-${player.match_number}`)
  );


  // matches をフィルタリングし、selectedSet に存在しない組み合わせのみを表示
  const filteredMatches = matches.filter(
    match => !selectedSet.has(`${match.level}-${match.match_number}`)
  );






  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">敗者プレイヤーを選択</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <ul className="player-list">
            <li
              onClick={() => {
                onSelect(null); // 空白を選択した場合
                onClose(); // モーダルを閉じる
              }}
              className="player-item empty-option"
            >
              空白を選択
            </li>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <li
                  key={match.id}
                  onClick={() => {
                    onSelect({
                      id: -1,
                      zenjuren_id: null,
                      name: `${parseInt(match.level, 10) - 1}-${match.match_number}の敗者`,
                      dojo: "",
                      level: match.level,
                      match_number: match.match_number,
                    });
                    onClose();
                  }}
                  className="player-item"
                >
                  <div className="player-info">
                    <span className="player-name">{parseInt(match.level, 10) - 1}-{match.match_number}の敗者</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="player-item text-muted">敗者リストにプレイヤーがいません</li>
            )}
          </ul>
        )}
      </div>

    </div>
  );
};

export default LoserPlayersModal;


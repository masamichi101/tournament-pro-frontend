"use client";

import React, { useEffect, useState } from "react";

import "../../../public/assets/css/matchDetailModal.css";
import { getMatch } from "@/action/tournament";
import ConfirmModal from "./ConfirmModal";
import { z } from "zod";

const schema = z.object({
  matchOrder: z
    .string()
    .regex(/^\d+$/, { message: "数字のみ入力してください" }) // 🔹 数字のみ許可
    .transform(Number) // 🔹 文字列を数値に変換
    .refine((num) => num > 0, { message: "1以上の数値を入力してください" }), // 🔹 1以上のみ許可
});

interface MatchDetailModalProps {
  matCount: number;
  matchCount: string;
  levelCount: number;
  stepLadderUid: string;
  previousLevelPlayers: any[]; // 前のレベルのプレイヤー
  winnerDisable: boolean;
  levelLabel: string;
  onClose: () => void;
  onSave: (matchData: any) => void;
  //onWinnerSelect: (winner: any, loser: any) => void;
  //onMatchOrderSelect: (newOrder: number, mat: number) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
    matCount,
    matchCount,
    levelCount,
    stepLadderUid,
    previousLevelPlayers,
    winnerDisable,
    levelLabel,
    onClose,
    onSave,
    //onWinnerSelect,
    //onMatchOrderSelect,
  }) => {

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<string>("");
  const [winner, setWinner] = useState<number>();
  const [loser, setLoser] = useState<number>();
  const [mat, setMat] = useState<number>(1);
  const [matchOrder, setMatchOrder] = useState<number>();
  const [error, setError] = useState<string>("");
  const [scores, setScores] = useState<{
    player1: { ippon: number; wazaari: number; yuko: number; shido: number };
    player2: { ippon: number; wazaari: number; yuko: number; shido: number };
  }>({
    player1: { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
    player2: { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
  });
  const [decision, setDecision] = useState<string>("");
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  const [tempWinner, setTempWinner] = useState<number | null>(null);
  const [tempLoser, setTempLoser] = useState<number | null>(null);


  useEffect(() => {

    const fetchMatchData = async () => {

      try {
        const { success, match: matchData } = await getMatch({
          step_ladder_uid: stepLadderUid,
          level: Number(levelCount),
          match_number: Number(matchCount),
        });

        if (success && matchData) {
          setMatchId(String(matchData.id));
          const winnerPlayer = previousLevelPlayers.find(player => player && player.id === matchData.winner?.id);
          setWinner(winnerPlayer?.id || "");
          setMat(matchData.mat || 0);
          setMatchOrder(matchData.match_order || 0);
          setScores({
            player1: Array.isArray(matchData.scores?.player1) ? { ippon: 0, wazaari: 0, yuko: 0, shido: 0 } : matchData.scores?.player1 || { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
            player2: Array.isArray(matchData.scores?.player2) ? { ippon: 0, wazaari: 0, yuko: 0, shido: 0 } : matchData.scores?.player2 || { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
          });
          setDecision(matchData.decision || "");
          const [min, sec] = (matchData.match_time || "00:00").split(":").map(Number);
          setMinutes(min);
          setSeconds(sec);
        }
      } catch (error) {
        console.error("Error fetching match data:", error);
      } finally {
        setLoading(false); // ローディング完了
      }
    };

    fetchMatchData();
  }, [stepLadderUid,levelCount, matchCount]);


  const handleResetClick = () => {
    setShowConfirmModal(true); // 承認モーダルを表示
  };

  const handleConfirmReset = () => {
    setShowConfirmModal(false); // モーダルを閉じる
    setWinner(null);
    setLoser(null);
    setScores({
      player1: { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
      player2: { ippon: 0, wazaari: 0, yuko: 0, shido: 0 },
    });
    setDecision("");
    setMinutes(0);
    setSeconds(0);

    handleWinnerChange({ target: { value: "" } } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleMatchOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 🔹 バリデーションを実行
    const result = schema.safeParse({ matchOrder: value });

    if (!result.success) {
      setError(result.error.errors[0].message); // 🔹 エラーメッセージを設定
      setMatchOrder(null); // 🔹 無効な値の場合は空にする
    } else {
      setError(""); // 🔹 エラーをクリア
      setMatchOrder(result.data.matchOrder); // 🔹 有効な値をセット
    }
  };


  const handleSave = () => {



    const matchData = {
      matchId: matchId,  // matchId を追加
      step_ladder_uid: stepLadderUid,
      level: levelCount,
      match_number: matchCount,
      mat,
      match_order: matchOrder,
      player1: previousLevelPlayers[0]?.id || null,
      player2: previousLevelPlayers[1]?.id || null,
      winner: tempWinner !== null ? tempWinner : winner || null, // 🔹 変更: `winner` を保持
      loser: tempLoser !== null ? tempLoser : loser || null,
      scores,
      decision,
      match_time: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      live: false,
    };


    //onWinnerSelect(tempWinner, tempLoser); // 勝者と敗者を親コンポーネントに渡す

    // onSave で matchData を親コンポーネントに渡す
    onSave(matchData);
    onClose();
  };

  const handleWinnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWinner = Number(e.target.value);

    // 🎯 修正：勝者なしの場合は null にする
    if (!selectedWinner || e.target.value === "none") {
        setTempWinner(null);
        setTempLoser(null);
        return;
    }


    setTempWinner(selectedWinner);

    const safePreviousLevelPlayers = (previousLevelPlayers || []).filter(player => player !== null);
    const loserPlayer = safePreviousLevelPlayers.find(player => player?.id !== selectedWinner) || null;
    setTempLoser(loserPlayer?.id || null);
  };
  const isDisabledDueToPlaceholder = previousLevelPlayers.some(p => p?.id === -1);




  return (
    <div className="modal-overlay">
      <ConfirmModal
        show={showConfirmModal}
        title="確認"
        message="本当にリセットしますか？ この操作は元に戻せません。"
        onConfirm={handleConfirmReset} // 承認後にリセット実行
        onCancel={() => setShowConfirmModal(false)} // キャンセル時は閉じるだけ
      />
      {loading ? (
                        // ローディング中の表示
        <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
        </div>
        ) : (
      <div className="modal-content">
        <h4 className="modal-title ">
          {levelLabel}
        </h4>
        <label className="modal-label">試合場</label>
        <select
          className="score-select bg-info text-white"
          value={mat}
          onChange={(e) => setMat(Number(e.target.value))}
        >
          {Array.from({ length: matCount }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>


        <label className="modal-label">試合順</label>
        {error && <p className="text-danger" style={{ fontSize: "12px" }}>{error}</p>}
        <select
          className="modal-select"
          value={matchOrder ?? ""}
          onChange={(e) => setMatchOrder(Number(e.target.value))}
        >
          <option value="">選択してください</option>
          {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>



        {/* 勝者選択 */}
        <label className="modal-label">勝者</label>
        {winnerDisable && <p className="text-danger" style={{ fontSize: "12px" }}>この欄は上位の対戦をリセットして変更してくだい</p>}
        <select
          className={`modal-select ${isDisabledDueToPlaceholder ? "opacity-50" : ""}`}
          value={winner || ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value); // `id` を数値型で取得
            setWinner(selectedId);
            handleWinnerChange(e); // `player.id` を渡す
          }} // 勝者が選択されたら呼び出す
          disabled={winnerDisable || isDisabledDueToPlaceholder}
        >
          <option value="">選択してください</option>
          {previousLevelPlayers.map((player, index) =>
            player ? (
              <option key={index} value={player.id}>
                {player.name}
              </option>
            ) : null
          )}
          <option value="none">勝者なし</option>
        </select>


        {/* スコア入力 */}
        <div className="score-table row mb-3">
          <div className="header col-4 px-0">
            <div className="score-table-child-header px-2">選手名</div>
            <div className="score-table-child-box d-flex align-items-center justify-content-center bg-info fw-bold fst-italic text-white">一本</div>
            <div className="score-table-child-box d-flex align-items-center justify-content-center bg-warning fw-bold fst-italic text-white">技あり</div>
            <div className="score-table-child-box d-flex align-items-center justify-content-center bg-info fw-bold fst-italic text-white">有効</div>
            <div className="score-table-child-box d-flex align-items-center justify-content-center bg-warning fw-bold fst-italic text-white">指導</div>
          </div>

          {/* Player 1 Row */}

          <div className={`player-row col-4 px-0 ${
            (winner && previousLevelPlayers[0]?.id !== winner) || isDisabledDueToPlaceholder ? "opacity-50" : ""
          }`}>
            <div className="score-table-child-header px-2">{previousLevelPlayers[0]?.name || "未定"}</div>
            <div className="score-table-child-box bg-info">
              <select
                className="score-select bg-info text-white"
                value={scores.player1.ippon}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player1: {
                      ...scores.player1,
                      ippon: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
              </select>
            </div>
            <div className="score-table-child-box bg-warning">
              <select
                className="score-select bg-warning text-white"
                value={scores.player1.wazaari}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player1: {
                      ...scores.player1,
                      wazaari: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
                >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <div className="score-table-child-box bg-info">
              <select
                className="score-select bg-info text-white"
                value={scores.player1.yuko}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player1: {
                      ...scores.player1,
                      yuko: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >

                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <div className="score-table-child-box bg-warning">
              <select
              className="score-select bg-warning text-white"
              value={scores.player1.shido}
              onChange={(e)=>
                setScores({
                  ...scores,
                  player1: {
                    ...scores.player1,
                    shido: Number(e.target.value)
                  }
                })
              }
              disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>

          {/* Player 2 Row */}
          <div className={`player-row col-4 px-0 ${
            (winner && previousLevelPlayers[1]?.id !== winner) || isDisabledDueToPlaceholder ? "opacity-50" : ""
          }`}>
            <div className="score-table-child-header px-2">{previousLevelPlayers[1]?.name || "未定"}</div>
            <div className="score-table-child-box bg-info">
              <select
                className="score-select bg-info text-white"
                value={scores.player2.ippon}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player2: {
                      ...scores.player2,
                      ippon: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
              </select>
            </div>
            <div className="score-table-child-box bg-warning">
              <select
                className="score-select bg-warning text-white"
                value={scores.player2.wazaari}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player2: {
                      ...scores.player2,
                      wazaari: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <div className="score-table-child-box bg-info">
              <select
                className="score-select bg-info text-white"
                value={scores.player2.yuko}
                onChange={(e)=> setScores({
                  ...scores,
                  player2: {
                    ...scores.player2,
                    yuko: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <div className="score-table-child-box bg-warning">
              <select
                className="score-select bg-warning text-white"
                value={scores.player2.shido}
                onChange={(e)=>
                  setScores({
                    ...scores,
                    player2: {
                      ...scores.player2,
                      shido: Number(e.target.value)
                    }
                  })
                }
                disabled={isDisabledDueToPlaceholder}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </div>


        {/* 決まり手入力 */}
        <label className="modal-label">決まり手</label>
        <input
          type="text"
          className={`modal-input ${winnerDisable || isDisabledDueToPlaceholder ? "opacity-50" : ""}`}
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="決まり手を入力 (例: 背負い投げ)"
          disabled={isDisabledDueToPlaceholder}
        />
        <div className={`time-input mb-3 ${winnerDisable || isDisabledDueToPlaceholder ? "opacity-50" : ""}`}>
          <label className="modal-label">試合時間</label>
          <div className="d-flex gap-2">
            <select
              className="modal-select"
              value={minutes ?? ""}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              <option value="">分</option>
              {Array.from({ length: 60 }, (_, i) => i).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>

            <select
              className="modal-select"
              value={seconds ?? ""}
              onChange={(e) => setSeconds(Number(e.target.value))}
            >
              <option value="">秒</option>
              {Array.from({ length: 60 }, (_, i) => i).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

        </div>



        {/* アクションボタン */}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn-danger" onClick={handleResetClick} disabled={winnerDisable}>
            リセット
          </button>
        </div>
      </div>
        )}
    </div>
  );
};

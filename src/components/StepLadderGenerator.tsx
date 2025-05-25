"use client";

import { createAllMatch, deleteAllMatch, getMatch, getStepLadder, toggleStepLadderConfirm, updateMatch, updateStepLadder } from "@/action/tournament";
import { UserType } from "lib/nextauth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsFileEarmarkDiff } from "react-icons/bs";
import { FaMinus, FaPlus } from "react-icons/fa";
import "../../public/assets/css/createStepLadder.css";
import "../../public/assets/css/tournamentGenerator.css";
import ConfirmModal from "./modal/ConfirmModal";
import LoadingModal from "./modal/LoadingModal";
import LoserPlayersModal from "./modal/LoserPlayerModal";
import { MatchDetailModal } from "./modal/MatchDetailModal";
import PlayerModal from "./modal/PlayerModal";

interface StepLadderGeneratorProps {
  user:UserType;
  matCount: number;
  stepLadderUid: string;
  stepLadderType: string;
  stepLadderConfirmed: boolean;
  stepLadderPlayersOrder:Record<string, { id: number; level: number; match_number: number }[]>;
  participants: any[];
  setParticipants: React.Dispatch<React.SetStateAction<any[]>>;
  selectedPlayers: any[]; // 親から渡される選択済みプレイヤー
  selectedThirdPlayers: any[]; // 親から渡される選択済みプレイヤー
  setSelectedPlayers: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedThirdPlayers: React.Dispatch<React.SetStateAction<any[]>>;

  onDelete: () => void;
  loserIds:{
    id: number;
    level: number;
    match_number: number;
    name: string;
    zenjuren_id: string;
  }[];
  thirdLoserIds:{
    id: number;
    level: number;
    match_number: number;
    name: string;
    zenjuren_id: string;
  }[];

  honsenStepladderUid: string;
  setLoserIds: React.Dispatch<React.SetStateAction<{id:number;level:number;match_number:number;name:string;zenjuren_id:string;}[]>>;
  setThirdLoserIds: React.Dispatch<React.SetStateAction<{id:number;level:number;match_number:number;name:string;zenjuren_id:string;}[]>>;

}


const generateStepLadderData = (count: number, initialData?: Record<string, any>) => {
  // 初期データが渡されている場合、それをそのまま返す
  if (initialData) {
    return initialData;
  }

  // 初期データが渡されていない場合、デフォルトを生成
  const data: Record<string, any> = {};
  let matchCount = count;
  let matchLevel = 1;

  while (matchCount >= 1) {
    let levelKey = `${matchLevel}回戦`;

    data[levelKey] = {};

    for (let i = 1; i <= matchCount; i++) {
      data[levelKey][i] = null; // 初期データ
    }

    matchCount = Math.floor(matchCount / 2);
    matchLevel += 1;
  }

  return data;
};


const StepLadderGenerator = ({
  user,
  matCount,
  stepLadderUid,
  stepLadderType,
  stepLadderConfirmed,
  stepLadderPlayersOrder,
  participants,
  setParticipants,
  selectedPlayers,
  setSelectedPlayers,
  selectedThirdPlayers,
  setSelectedThirdPlayers,
  onDelete,
  loserIds,
  thirdLoserIds,
  honsenStepladderUid,
  setLoserIds,
  setThirdLoserIds,
  }:StepLadderGeneratorProps) => {
  const initialStepLadderCount = stepLadderPlayersOrder
  ? Object.keys(stepLadderPlayersOrder[Object.keys(stepLadderPlayersOrder)[0]] || {}).length // 最初のラウンドのプレイヤー数
  : 4;


  const [loading, setLoading] = useState(false);
  const [loadingModal,setLoadingModal] = useState(false);
  const [confirm, setConfirm] = useState(stepLadderConfirmed);
  const [players,setPlayers] = useState(participants);


  const [stepLadderCount, setStepLadderCount] = useState<number>(initialStepLadderCount);
  const [stepLadderData, setStepLadderData] = useState<any>(generateStepLadderData(4, stepLadderPlayersOrder) );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoserPlayerModalOpen, setIsLoserPlayerModalOpen] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<{ level: string; matchCount: string } | null>(null);
  const [isProcessingIncDec, setIsProcessingIncDec] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<{
      match: string;
      level: string;
      levelLabel: string;
      previousLevelPlayers?: any[];
      winnerDisable?: boolean;
      winner?: any;
    } | null>(null);

  const isFetching = useRef(false);

  useEffect(() => {
    setStepLadderData(generateStepLadderData(initialStepLadderCount, stepLadderPlayersOrder));
  }, [stepLadderPlayersOrder]);

  useEffect(() => {
    if (stepLadderType === "本戦" || stepLadderType === "3位決定戦") {
      const newLosers = [];
      Object.entries(stepLadderData).forEach(([levelKey, matches]) => {
        const levelNum = parseInt(levelKey.replace("回戦", ""), 10);

        Object.entries(matches).forEach(([indexStr, player]) => {
          if (player && player.loser) {
            const index = parseInt(indexStr, 10);
            newLosers.push({
              id: player.id,
              level: levelNum + 1,
              match_number: Math.floor((index + 1) / 2),
              name: player.name,
              zenjuren_id: player.zenjuren_id,
            });
          }
        });
      });

      if (stepLadderType === "本戦") {
        setLoserIds(newLosers);
      } else {
        setThirdLoserIds(newLosers);
      }
    }

  }, [stepLadderData]);

  useEffect(() => {
    if(stepLadderType === "3位決定戦") {
      const updatedPlayersOrder = { ...stepLadderPlayersOrder };

      Object.entries(stepLadderPlayersOrder).forEach(([levelKey, matches]) => {
        Object.entries(matches).forEach(([matchKey, player]) => {

          if (player && player.level && player.match_number) {

            const matchedLoser = loserIds.find(
              (loser) =>

                loser.level === player.level &&
                loser.match_number === player.match_number
            );


            if (matchedLoser) {
              updatedPlayersOrder[levelKey][matchKey] = {
                ...player,
                id: matchedLoser.id,
                name: matchedLoser.name,
                zenjuren_id: matchedLoser.zenjuren_id,

              };
            }
          }
        });
      });


      // 🔄 更新を反映
      setStepLadderData(updatedPlayersOrder);

    }
  }, [loserIds]);





  const getGap = (levelIndex: number) => {
    const gapMap = [10, 60, 160, 360, 760, 1560, 3160, 6360, 12760, 25560, 51160];
    return gapMap[levelIndex] || 10; // デフォルト値は 10px
  };
  const getPadding = (levelIndex: number) => {
    const paddingTop = [0, 25, 75, 175, 375, 775, 1575, 3175, 6375, 12775, 25575];
    return paddingTop[levelIndex] || 0; // デフォルト値は 0px
  }

  const getLineHeight = (levelIndex: number) => {
    const lineHeightMap = [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
    return lineHeightMap[levelIndex] || 25; // デフォルトは25px
  };

  const handleShowConfirmModal = (message: string, action: () => void) => {
    setConfirmMessage(message); // メッセージをセット
    setConfirmAction(() => action); // 実行する関数をセット
    setShowConfirmModal(true); // モーダルを表示
  };



  const handleIncrement = () => {
    if (stepLadderCount < 1024) {
      setIsProcessingIncDec(true);
      const newCount = stepLadderCount * 2;

      // 新しいトーナメントデータを生成
      const newStepLadderData = generateStepLadderData(newCount);

      // 元データの最初のキー（例: "準決勝"）を取得
      const firstRoundKey = Object.keys(newStepLadderData)[0]; // 新しいデータの1回戦
      const previousFirstRoundKey = Object.keys(stepLadderData)[0]; // 元データの最初のラウンド（例: 準決勝）

      if (firstRoundKey && previousFirstRoundKey) {
        // 元データを1回戦に移動
        const updatedFirstRound = {
          ...newStepLadderData[firstRoundKey], // 新しいデータの1回戦
          ...stepLadderData[previousFirstRoundKey], // 元データの準決勝（例）
        };

        // 新しいデータに移動した1回戦データを適用して更新
        setStepLadderData({
          ...newStepLadderData, // 新しく生成された全データ
          [firstRoundKey]: updatedFirstRound, // 1回戦データ
        });
      } else {
        // データ移動が不要な場合、新しいデータをそのまま設定
        setStepLadderData(newStepLadderData);
      }

      // カウントを更新
      setStepLadderCount(newCount);
      setIsProcessingIncDec(false);
    }
  };




  const handleDecrement = () => {
    if (stepLadderCount > 4) {
      const newCount = stepLadderCount / 2;
      setIsProcessingIncDec(true);

      // 新しいトーナメントデータを生成（列数を減らす）
      const newStepLadderData = generateStepLadderData(newCount);

      // 元データの最初のキーを取得（例: "1回戦"）
      const firstRoundKey = Object.keys(newStepLadderData)[0]; // 新しいデータの1列目（例: "1回戦"）
      const previousFirstRoundKey = Object.keys(stepLadderData)[0]; // 元データの1列目（例: "1回戦"）

      let updatedSelectedPlayers = selectedPlayers;

      if (firstRoundKey && previousFirstRoundKey) {
        // 元データの1列目（例: "1回戦"）の前半部分を取得
        const originalFirstRound = stepLadderData[previousFirstRoundKey]; // 元データの1列目
        const truncatedFirstRound = Object.fromEntries(
          Object.entries(originalFirstRound).slice(0, newCount) // 前半部分のみ取得
        );

        // 新しいデータの1列目に前半部分をマージ
        const updatedFirstRound = {
          ...newStepLadderData[firstRoundKey], // 新しいデータの1回戦
          ...truncatedFirstRound, // 元データの前半部分をマージ
        };

        // 新しいデータに更新
        setStepLadderData({
          ...newStepLadderData,         // 新しく生成された全データ
          [firstRoundKey]: updatedFirstRound, // 前半の1列目を上書き
        });

        // `selectedPlayers` を更新（1列目の選手のみを含むようにフィルタリング）
        updatedSelectedPlayers = Object.values(updatedFirstRound).filter((player) => player !== null);
      } else {
        // データ移動が不要な場合、新しいデータをそのまま設定
        setStepLadderData(newStepLadderData);
        updatedSelectedPlayers = [];
      }

      // カウントを更新
      setStepLadderCount(newCount);

      // `selectedPlayers` を更新
      setSelectedPlayers(updatedSelectedPlayers);

      setIsProcessingIncDec(false);
    }
  };




  const handlePlayerSelect = async(player: any) => {

    if (selectedMatch) {
      const { level, matchCount } = selectedMatch;

      // 現在のマッチに割り当てられているプレイヤーを取得
      const currentAssignedPlayer = stepLadderData[level][matchCount];

      // トーナメントデータを更新
      setStepLadderData((prevData: any) => ({
        ...prevData,
        [level]: {
          ...prevData[level],
          [matchCount]: player, // 選択されたプレイヤーをセット
        },
      }));
      // `selectedPlayers` を更新
      if (stepLadderType === "本戦") {
        setSelectedPlayers((prev: any[]) => {
          if (!player) {
            return currentAssignedPlayer
              ? prev.filter((p) => p.id !== currentAssignedPlayer.id)
              : prev;
          }
          const updatedPlayers = currentAssignedPlayer
            ? prev.filter((p) => p.id !== currentAssignedPlayer.id)
            : prev;
          return [...updatedPlayers, player];
        });
      }
      if (stepLadderType === "3位決定戦") {
        setSelectedThirdPlayers((prev: any[]) => {
          if (!player) {
            return currentAssignedPlayer
              ? prev.filter((p) => p.id !== currentAssignedPlayer.id)
              : prev;
          }
          const updatedPlayers = currentAssignedPlayer
            ? prev.filter((p) => p.id !== currentAssignedPlayer.id)
            : prev;
          return [...updatedPlayers, player];
        });
      }

    }

  };





  useEffect(() => {
    const updateData = async () => {
      try {
        const players_order = stepLadderData;
        await updateStepLadder({ accessToken: user.accessToken,stepLadderUid,players_order });
      } catch (error) {
        console.error("Error updating StepLadder:", error);
      }
    };

    updateData();

  }, [stepLadderData]);


  const handleConfirmEntry = async () => {
    setLoadingModal(true);

    // 処理中モーダルを表示
    try {
      const matchResponse = await createAllMatch({ accessToken:user.accessToken,stepLadderUid });

      if (!matchResponse.success) {
        console.error("対戦カードの作成に失敗しました");
        return;
      }

      const confirmResponse = await toggleStepLadderConfirm({ accessToken:user.accessToken,stepLadderUid, confirmed: true });

      if (!confirmResponse.success) {
        console.error("step ladderのconfirmedの更新に失敗しました");
        return;
      }


      const stepLadderResponse = await getStepLadder({ uid: stepLadderUid });


      if (stepLadderResponse.success && stepLadderResponse.stepLadder) {

        setStepLadderData(stepLadderResponse.stepLadder.players_order); // players_order を更新
      } else {
        console.error("StepLadder の更新データの取得に失敗しました");
      }

      setConfirm(true);


    } finally {
      setLoadingModal(false); // 処理終了
    }
  };

  const handleDeleteEntry = async () => {
    setLoadingModal(true);

    try {
      const deleteResponse = await deleteAllMatch({ accessToken:user.accessToken,stepLadderUid });

      if (!deleteResponse.success) {
        console.error("対戦カードの削除に失敗しました");
        return;
      }

      const confirmResponse = await toggleStepLadderConfirm({ accessToken:user.accessToken,stepLadderUid, confirmed: false });

      if (!confirmResponse.success) {
        console.error("step ladderのconfirmedの更新に失敗しました");
        return;
      }

      setConfirm(false);
      onDelete();
    } finally {
      setLoadingModal(false); // 処理終了
    }
  };



  const handleMatchDetailClick = useCallback(async (level: string, match: string) => {

    if (isFetching.current) return; // 🔹 すでにリクエスト中ならスキップ
    isFetching.current = true;



    const levelNumber = parseInt(level.replace("回戦", ""), 10);
    const matchNumber = Number(match);

    const matchCount = Object.keys(stepLadderData[level]).length;
    const levelLabel =
      matchCount === 1 ? "決勝" :
      matchCount === 2 ? "準決勝" :
      matchCount === 4 ? "準々決勝" :
      `${levelNumber - 1}回戦`;

    // 🔹 前のラウンドのプレイヤーを取得
    const currentLevelIndex = Object.keys(stepLadderData).indexOf(level);
    let previousLevelPlayers: any[] = [];

    if (currentLevelIndex > 0) {
        const previousLevel = Object.keys(stepLadderData)[currentLevelIndex - 1];
        const previousLevelMatches = stepLadderData[previousLevel];
        previousLevelPlayers = [
            previousLevelMatches[Number(match) * 2 - 1] || null,
            previousLevelMatches[Number(match) * 2] || null
        ];
    }

    try {
      // 現在の試合データ取得
      const response = await getMatch({
        step_ladder_uid: stepLadderUid,
        level: levelNumber,
        match_number: matchNumber,
      });

      if (!response.success || !response.match) {
        console.error("試合データの取得に失敗しました");
        return;
      }

      // 1階層上（次レベル）の winner を stepLadderData から参照して winnerDisable を判断
      const nextLevelKey = `${levelNumber + 1}回戦`;
      const nextMatchKey = Math.floor((matchNumber + 1) / 2);
      const nextLevelWinner = stepLadderData?.[nextLevelKey]?.[nextMatchKey];
      console.log("nextLevelWinner", nextLevelWinner);
      const isWinnerLocked = !!nextLevelWinner?.id;

      setSelectedMatchDetail({
        level,
        match,
        previousLevelPlayers,
        winnerDisable:isWinnerLocked, // ← 上の階層に winner がいるなら編集不可
        levelLabel,
        winner: response.match.winner ?? null,
      });


        setIsDetailModalOpen(true);
    } catch (error) {
        console.error("試合データの取得に失敗しました:", error);
    } finally {
        isFetching.current = false;
    }
  }, [stepLadderUid, stepLadderData]); // ✅ `useCallback` で不要な再生成を防ぐ



  const handleUpdateMatch = async (matchData) => {
    if (!selectedMatchDetail) return;

    try {
      const requestData = {
        ...matchData,
        accessToken: user.accessToken, // ✅ `user.accessToken` をセット
      };


      // API リクエストで試合データを更新
      const response = await updateMatch(requestData);

      if (response.success) {
        const { winner, loser} = matchData;
        const currentLevelNumber = parseInt(selectedMatchDetail.level.replace("回戦", ""), 10);
        const previousLevelKey = `${currentLevelNumber - 1}回戦`;


        // 🔹 既存の勝者情報を取得
        const previousWinner = selectedMatchDetail.winner || null;


        if (winner === undefined && loser === undefined) return;
        const isSameWinner =
          selectedMatchDetail.winner &&
          typeof selectedMatchDetail.winner === "object"
            ? selectedMatchDetail.winner.id === winner
            : selectedMatchDetail.winner === winner;

        const isMatChanged = selectedMatchDetail.winner?.mat !== matchData.mat;
        const isMatchOrderChanged = selectedMatchDetail.winner?.match_order !== matchData.match_order;

        if (isSameWinner && !isMatChanged && !isMatchOrderChanged) {
          return;
        }


        const winnerPlayer = selectedMatchDetail.previousLevelPlayers?.find(
          (player) => Number(player?.id) === Number(winner)
        ) || null;

        const loserPlayer = selectedMatchDetail.previousLevelPlayers?.find(
          (player) => Number(player?.id) === Number(loser)
        ) || null;



        if (stepLadderType === "3位決定戦") {
          setThirdLoserIds((prevLoserIds) => {
            if (winner === previousWinner) return prevLoserIds;
            return [...prevLoserIds.filter((id) => id !== winner), loser].filter(Boolean);
          });
        } else {
          setLoserIds((prevLoserIds) => {
            if (winner === previousWinner) return prevLoserIds;
            return [...prevLoserIds.filter((id) => id !== winner), loser].filter(Boolean);
          });

          setParticipants((prevParticipants) =>
            prevParticipants.map((participant) => ({
              ...participant,
              loser: participant.id === matchData.loser && previousWinner !== winner ? true : participant.loser,
            }))
          );
        }

        // ✅ `stepLadderData` を更新
        setStepLadderData((prevData: any) => {
          if (!prevData[previousLevelKey]) return prevData; // 🛑 前のラウンドが存在しない場合は何もしない

          // 🔹 `previousLevelKey` 内のプレイヤー情報を更新
          const updatedPreviousLevel = { ...prevData[previousLevelKey] };

          Object.keys(updatedPreviousLevel).forEach((matchKey) => {
            const original = updatedPreviousLevel[matchKey];
            if (!original) return;

            const player = { ...original }; // 安全にコピー
            const playerId = player.id;

            if (winner === null) {
              player.loser = false;
            } else {
              if (playerId === winner) {
                player.loser = false; // 勝者 → loser = false
              } else if (playerId === loser && previousWinner !== winner) {
                player.loser = true; // 敗者 → loser = true
              } else {
                // 変更されてないプレイヤーの loser フラグは維持
              }
            }

            updatedPreviousLevel[matchKey] = player;
          });

          const updatedMatchData =
            winner === null
              ? {
                  ...loserPlayer,
                  mat: matchData.mat,
                  match_order: matchData.match_order,
                  loser: true,
                }
              : {
                  ...winnerPlayer,
                  mat: matchData.mat,
                  match_order: matchData.match_order,
                  loser: false,
                };



          return {
            ...prevData,
            [previousLevelKey]: updatedPreviousLevel,
            [selectedMatchDetail.level]: {
              ...prevData[selectedMatchDetail.level],
              [selectedMatchDetail.match]: updatedMatchData,
            },
          };
        });



        // 🔹 更新後の勝者情報を `selectedMatchDetail` に保存（次回の比較用）
        setSelectedMatchDetail((prev) => ({
          ...prev,
          winner,
        }));

      } else {
        console.error("試合データの更新に失敗しました");
      }
    } catch (error) {
      console.error("APIエラー:", error);
    }
  };




  const effectiveLoserIds = stepLadderType === "3位決定戦" ? thirdLoserIds : loserIds;





  return (
    <div className="tournament-container">
      <LoadingModal show={loadingModal} />
      <ConfirmModal
        show={showConfirmModal}
        title="確認"
        message={confirmMessage}
        onConfirm={() => {
          confirmAction(); // ✅ 実際の処理を実行
          setShowConfirmModal(false);
        }}
        onCancel={() => setShowConfirmModal(false)} // モーダルを閉じる
      />
      <div id="light-circle " className="px-4">
        {!confirm ? (
          <div className="d-flex align-items-center">
            <div className="red-circle"></div>
            <p className="text-danger">未確定</p>
          </div>

        ):(
          <div className="d-flex align-items-center">
            <div className="green-circle"></div>
            <p className="text-success">確定</p>
          </div>

          )}


      </div>


      {/* コントロールボタン */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="controls mb-2 d-flex align-items-center">
          <p className="px-3 py-auto font-24 fw-bold fst-italic">{stepLadderCount}人規模</p>
          <button className="btn btn-dark mt-0 " onClick={handleIncrement} disabled={stepLadderCount >= 1024 || isProcessingIncDec || confirm}>
            <FaPlus />
          </button>
          <button
            className="btn btn-secondary mt-0 "
            onClick={() => handleShowConfirmModal("データが消える可能性があります。本当に縮小しますか？", handleDecrement)} // モーダルを表示
            disabled={stepLadderCount <= 4 || isProcessingIncDec || confirm}
          >
            <FaMinus />
          </button>

        </div>
        {!confirm ? (
          <button className="btn btn-primary mb-2" onClick={() => handleShowConfirmModal("エントリーを確定しますか？", handleConfirmEntry)}
          disabled={loading}>
            エントリーを確定する
          </button>
        ) : (
          <button className="btn btn-danger mb-2" onClick={() => handleShowConfirmModal("2回戦以降のデータを削除してもよろしいですか？", handleDeleteEntry)} disabled={loading}>
            データを削除して選手を追加
          </button>
        )}


      </div>


      {/* トーナメント表 */}
      <div className="tournament-box">
        <div className="tournament">
          {Object.entries(stepLadderData).map(([level, matchDatas]: any, levelIndex) => (
            <div key={level} className="tournament-level-wrapper">
              {/* トーナメントレベルのヘッダー */}
              <div className="tournament-level-header">
                {Object.keys(matchDatas).length === 1 ? (
                  <h3>優勝</h3>
                ) : Object.keys(matchDatas).length === 2 ? (
                  <h3>決勝</h3>
                ) : Object.keys(matchDatas).length === 4 ? (
                  <h3>準決勝</h3>
                ) : (
                  <h3>{level}</h3> // デフォルトはそのまま level を表示
                )}
              </div>

              {/* トーナメントレベルの試合 */}
              <div
                className="tournament-level"
                style={{
                  gap: `${getGap(levelIndex)}px`,
                  paddingTop: `${getPadding(levelIndex)}px`,
                  "--line-height": `${getLineHeight(levelIndex)}px`, // カスタムプロパティを設定
                } as React.CSSProperties} // 型エラー回避のため型指定
              >
                {Object.entries(matchDatas).map(([matchCount, player]: any) => (
                  <div
                      key={matchCount}
                      className={`
                        ${player && effectiveLoserIds.some((entry) => entry.id === player.id) ? "loser" : ""}
                        ${confirm && levelIndex === 0 && !player ? "player-null" : ""}
                      `}
                    >
                    <div
                        className={`match
                          ${player?.id ? "winner-border-head" : ""}
                          ${player?.id && stepLadderData[`${parseInt(level.replace("回戦", "")) + 1}回戦`]?.[Math.floor((parseInt(matchCount) + 1) / 2)]?.id === player.id ? "winner-border" : ""}
                          ${player?.id && effectiveLoserIds.includes(player.id) ? "loser" : ""}
                        `}
                      >


                      <div
                        className={` ${
                          Object.keys(matchDatas).length !== 1 // "決勝戦"ではない場合に奇数偶数を判定
                            ? parseInt(matchCount) % 2 === 0
                              ? "match-line-even"
                              : "match-line-odd"
                            : "match-line-final" // "決勝戦"の場合
                        }`}
                      >

                        {levelIndex === 0 ? (
                          <>
                            <input
                                type="text"
                                placeholder={"-"}
                                value={player?.name || ""}
                                onClick={() => {
                                  if (stepLadderType === "3位決定戦") {
                                    setIsLoserPlayerModalOpen(true); // 3位決定戦なら敗者モーダルを開く
                                  } else {
                                    setIsModalOpen(true); // それ以外は通常のプレイヤーモーダルを開く
                                  }
                                  setSelectedMatch({ level, matchCount }); // 選択されたマッチを記録
                                }}
                                readOnly
                                disabled={confirm}
                            />
                          </>

                        ) : (

                              <span>{player ? player.name : ""}</span>
                        )}
                      </div>

                      {!confirm ? (
                        <>

                          <div className="match-detail opacity-50" >
                              <BsFileEarmarkDiff />
                          </div>

                        </>

                      ) :
                      <>
                        {levelIndex !== 0 && (
                          <div className="match-detail-number" >
                            {parseInt(level.replace("回戦", ""), 10) - 1}-{matchCount}
                          </div>
                        )}

                        <div className="match-detail" onClick={() => handleMatchDetailClick(level, matchCount)}>
                          <BsFileEarmarkDiff />
                        </div>
                        <div className="mat-matchOrder" >
                          {player?.mat || player?.match_order ? (
                            <>
                              <span className="mat">{player.mat}<small>試合場</small></span>
                              <span className="matchOrder">{player.match_order}<small>試合目</small></span>
                            </>
                          ) : (
                            <span className="mat"></span>
                          )}
                        </div>
                      </>

                      }


                    </div>

                 </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>


      {isModalOpen && (
        <PlayerModal
          players={players}
          selectedPlayers={selectedPlayers} // 選択済みプレイヤーを渡す
          onSelect={handlePlayerSelect}
          onClose={() => setIsModalOpen(false)}
        />

      )}
      {isLoserPlayerModalOpen && (
        <LoserPlayersModal
          selectedThirdPlayers={selectedThirdPlayers}

          onSelect={handlePlayerSelect}
          honsenStepladderUid={honsenStepladderUid}
          onClose={() => setIsLoserPlayerModalOpen(false)}
        />

      )}
      {isDetailModalOpen && selectedMatchDetail && (
        <MatchDetailModal
          matCount={matCount} // トーナメントの規模
          matchCount={selectedMatchDetail.match} // 選択された試合番号
          levelCount={parseInt(selectedMatchDetail.level, 10) || 0}  // 試合のレベル
          levelLabel={selectedMatchDetail.levelLabel} // レベルのラベル
          stepLadderUid={stepLadderUid} // ステップラダーのUID
          previousLevelPlayers={selectedMatchDetail.previousLevelPlayers || []} // 前のレベルのプレイヤーデータ
          winnerDisable={selectedMatchDetail.winnerDisable} // 勝者選択の無効化
          onClose={() => setIsDetailModalOpen(false)} // モーダルを閉じる処理
          //onWinnerSelect={handleWinnerDecide}
          //onMatchOrderSelect={handleMatchOrderDecide}
          onSave={handleUpdateMatch}
        />
      )}


    </div>
  );
};

export default StepLadderGenerator;

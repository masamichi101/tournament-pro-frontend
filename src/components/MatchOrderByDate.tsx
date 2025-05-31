"use client";
import "../../public/assets/css/matchOrders.css";
import React, { useEffect, useState } from "react";
import {
  getStepLadders,
  getMatchesAll,
  Match,
  StepLadder,
  Category,
  updateMatch,
  getMatch,
} from "@/action/tournament";
import { UserType } from "lib/nextauth";
import { MatchDetailModal } from "./modal/MatchDetailModal";

const MatchOrderByDate = ({
  user,
  categories,
  matCount,
}: {
  user: UserType;
  categories: Category[];
  matCount: number;
}) => {
  const [stepLadders, setStepLadders] = useState<StepLadder[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matMatches, setMatMatches] = useState<Match[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allStepLadders: StepLadder[] = [];
        const allMatches: Match[] = [];

        for (const cat of categories) {
          const stepRes = await getStepLadders({ uid: cat.uid });
          if (stepRes.success) {
            allStepLadders.push(...stepRes.stepLadders);

            for (const step of stepRes.stepLadders) {
              const matchRes = await getMatchesAll({ stepLadderUid: step.uid });
              if (matchRes.success && matchRes.matches) {
                const filtered = matchRes.matches.filter(
                  (m) => !(m.level === 2 && (!m.player1 || !m.player2))
                );
                allMatches.push(...filtered);
              }
            }
          }
        }

        // グループ化（mat 番号ごとに）
        const grouped: Match[][] = Array.from({ length: matCount }, () => []);
        allMatches.forEach((match) => {
          if (match.mat && match.mat <= matCount) {
            grouped[match.mat - 1].push(match);
          }
        });

        // 並び替え（match_number のある試合は前に昇順、それ以外はそのまま）
        const sortedGrouped = grouped.map((matGroup) => {
          const withOrder = matGroup
            .filter((m) => m.match_order != null)
            .sort((a, b) => a.match_order - b.match_order);

          const withoutOrder = matGroup.filter((m) => m.match_order == null);
          return [...withOrder, ...withoutOrder];
        });

        setStepLadders(allStepLadders);
        setMatches(allMatches);
        setMatMatches(sortedGrouped);
      } catch (err) {
        console.error("マッチデータ取得エラー", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categories,refreshKey]);

  const fetchMatchesForStepLadders = async (stepLadders: StepLadder[]) => {
      setLoading(true);
      try {
        const allMatches: Match[] = [];

        for (const stepLadder of stepLadders) {
          const matchRes = await getMatchesAll({ stepLadderUid: stepLadder.uid });

          if (matchRes.success && matchRes.matches) {
            // ✅ level が 2 で player1 もしくは player2 が null の場合、追加しない
            const filteredMatches = matchRes.matches.filter(
              (match) => !(match.level === 2 && (!match.player1 || !match.player2))
            );

            allMatches.push(...filteredMatches);
          }
        }

        // 試合をマットごとにグループ化
        const groupedMatches: Match[][] = [];
        allMatches.forEach((match) => {
          const matIndex = match.mat - 1;
          if (!groupedMatches[matIndex]) {
            groupedMatches[matIndex] = [];
          }
          groupedMatches[matIndex].push(match);
        });


        setMatches(allMatches);
        setMatMatches(groupedMatches);
      } catch (error) {
        console.error("試合データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };


  const handleMatchUpdate = async (matchData) => {
      if (!selectedMatch) return;


      try {
        const requestData = {
          ...matchData,
          accessToken: user.accessToken, // ✅ `user.accessToken` をセット
        };

        // API リクエストで試合データを更新
        const response = await updateMatch(requestData);

        if (!response.success || !response.match) {
          console.error("試合データの更新に失敗しました");
          return;
        }

        const updatedMatchResponse = await getMatch({
          step_ladder_uid: response.match.step_ladder,
          level: response.match.level,
          match_number: response.match.match_number,
        });

        if (!updatedMatchResponse.success || !updatedMatchResponse.match) {
          console.error("試合データの取得に失敗しました");
          return;
        }

        const updatedMatch = updatedMatchResponse.match;


        if (typeof updatedMatch.player1 !== "object") {
          console.error("❌ `player1` に詳細データが含まれていません", updatedMatch.player1);
        }
        if (typeof updatedMatch.player2 !== "object") {
          console.error("❌ `player2` に詳細データが含まれていません", updatedMatch.player2);
        }

        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match.id === updatedMatch.id ? { ...match, ...updatedMatch } : match
          )
        );

        setMatMatches((prevMatMatches) =>
          prevMatMatches.map((matGroup) =>
            matGroup.map((match) =>
              match.id === updatedMatch.id ? { ...match, ...updatedMatch } : match
            )
          )
        );

        // `selectedMatch` を更新
        setSelectedMatch(updatedMatch);

        setIsModalOpen(false);
        setRefreshKey((prev) => prev + 1);

        await fetchMatchesForStepLadders(stepLadders);
      } catch (error) {
        console.error("試合の更新エラー:", error);
      }
    };


  return (
    <>
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="matchOrders-box">
          <div className="d-flex flex-nowrap">
            {matMatches.map((matchesInMat, matIndex) => (
              <div
                key={matIndex}
                className="d-inline-block me-3 match-card"
                style={{ minWidth: "280px", maxWidth: "280px" }}
              >
                <h6 className="text-center">第 {matIndex + 1} 試合場</h6>
                {matchesInMat.map((match) => (
                  <div
                    className="card mb-2"
                    key={match.id}
                    onClick={() => {
                      setSelectedMatch(match);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="card-header position-relative">
                      <h6 className="text-center mb-0 fs-6 text-wrap">{match.name}</h6>
                      <div className="position-absolute top-0 start-100 translate-middle border bg-light px-2 rounded-pill">{match.match_order ?? "未定"}</div>
                    </div>
                    <div
                      className={`card-body ${
                        !match.winner ? "before-match" : "after-match"
                      }`}
                    >
                      {[match.player1, match.player2].map((player, i) =>
                        player ? (
                          <div key={i} className={`follow-item d-flex align-items-center ${match.winner && player.id !== match.winner.id ? "opacity-25" : ""}`}>
                            <div className="follow-item__img">
                              <img
                                src={
                                  player.gender === "male"
                                    ? "/assets/images/icons/judoka-man.png"
                                    : player.gender === "female"
                                    ? "/assets/images/icons/judoka-woman.png"
                                    : "/assets/images/icons/judoka-person.png"
                                }
                                alt={player.name}
                                className="img-fluid rounded-circle"
                                style={{ width: "40px", height: "40px" }}
                              />
                            </div>
                            <div className="follow-item__content ms-2">
                              <h6 className="mb-0">{player.name}</h6>
                              <small className="text-muted">{player.dojo}</small>
                            </div>
                          </div>
                        ) : (
                          <div key={i} className="follow-item">
                            <div className="follow-item__content">
                              <h6 className="text-muted">未定</h6>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && selectedMatch && (
        <MatchDetailModal
          user={user}
          matchCount={String(selectedMatch.match_number)}
          levelCount={selectedMatch.level}
          levelLabel={selectedMatch.name}
          stepLadderUid={selectedMatch.step_ladder}
          previousLevelPlayers={[selectedMatch.player1, selectedMatch.player2]}
          winnerDisable={!selectedMatch.winner}
          matCount={matCount}
          onClose={() => setIsModalOpen(false)}
          onSave={handleMatchUpdate} // 必要に応じて渡す
        />
      )}
    </>
  );
};

export default MatchOrderByDate;

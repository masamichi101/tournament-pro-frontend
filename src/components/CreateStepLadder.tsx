"use client";

import { getPlayersList } from "@/action/participants";
import { createStepLadder, getStepLadders, getTournamentCategoryList,getTournamentsByUserAccount } from "@/action/tournament";
import React, { useEffect, useMemo, useState } from "react";
import StepLadderFirstForm from "./form/StepLadderFirstForm";
import StepLadderGenerator from "./StepLadderGenerator";
import { UserType } from "lib/nextauth";
import toast from "react-hot-toast";


interface StepLadderFirstFormData {
  tournamentCategoryUid: string;
  type: string;
  stepLadderCount:number;
  playerCount?:number|null;
  players_order?:Record<string, string[]> | null;

}

const CreateStepLadder= ({ user }: { user: UserType }) => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState({ uid: "" });
    const [participants, setParticipants] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
    const [selectedThirdPlayers, setSelectedThirdPlayers] = useState<any[]>([]);
    const [stepLadders, setStepLadders] = useState([]);
    const [honsenStepladderUid,setHonsenStepladderUid] =useState("");
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loserIds, setLoserIds] = useState<{id:number;level:number;match_number:number;name:string;zenjuren_id:string;}[]>([]);
    const [thirdLoserIds, setThirdLoserIds] = useState<{id:number;level:number;match_number:number;name:string;zenjuren_id:string;}[]>([]);


    const isHonSenExist = useMemo(() => {
      return stepLadders.some((stepLadder) => stepLadder.type === "本戦");
    }, [stepLadders]);
    const isThirdExist = useMemo(() => {
      return stepLadders.filter((stepLadder) => stepLadder.type === "3位決定戦").length >= 2;
    }, [stepLadders]);



    useEffect(() => {
      const fetchStepLadderData = async () => {
        try {
          const tournamentRes = await getTournamentsByUserAccount(user.accessToken);
          if (tournamentRes.success) {
            setTournaments(tournamentRes.tournaments || []);
          }
        } catch (error) {
          console.error("Failed to fetch tournament data:", error);
        }
      };
      fetchStepLadderData();
    }, []);


    const handleTournamentChange = async (event) => {
      const selectedUid = event.target.value;
      const tournamentObj = tournaments.find((t) => t.uid === selectedUid);


      setSelectedTournament(tournamentObj);

      setCategories([]); // カテゴリーリストをクリア
      setSelectedCategory({ uid: "" }); // 選択中のカテゴリーをリセット
      setParticipants([]); // 参加者リストをクリア

      if (selectedUid) {
        try {
          const categoryRes = await getTournamentCategoryList({ uid: selectedUid });
          if (categoryRes.success) {
            setCategories(categoryRes.categories || []);
          }
        } catch (error) {
          console.error("カテゴリーの取得に失敗しました:", error);
        }
      } else {
        setCategories([]);
      }
    };

    const handleCategoryChange = async (event) => {
      setLoading(true)
      setLoading2(true)
      const selectedUid = event.target.value;
      setSelectedCategory({ uid: selectedUid });
      if (selectedUid) {
        try {
          const playerRes = await getPlayersList({ uid: selectedUid });
          if (playerRes.success) {
            setParticipants(playerRes.players || []);
          }

          const stepLadderRes = await getStepLadders({ uid: selectedUid });

          if (stepLadderRes.success) {

            const fetchedStepLadders = stepLadderRes.stepLadders || [];
            setStepLadders(fetchedStepLadders);
            const honsenStepladder = fetchedStepLadders.find(
              (stepLadder) => stepLadder.type === "本戦"
            );
            if (honsenStepladder) {
              setHonsenStepladderUid(honsenStepladder.uid);
            } else {
              setHonsenStepladderUid("");
            }




            if (fetchedStepLadders.length > 0) {
              let mainPlayers: any[] = [];
              let thirdPlayers: any[] = [];
              fetchedStepLadders.forEach((stepLadder) => {
                const firstRoundKey = Object.keys(stepLadder.players_order)[0];
                if (!firstRoundKey) return;

                const playersInFirstRound = Object.values(stepLadder.players_order[firstRoundKey] || {})
                  .filter((player) => player !== null);

                if (stepLadder.type === "本戦") {
                  mainPlayers = playersInFirstRound;
                } else if (stepLadder.type === "3位決定戦") {
                  thirdPlayers = [...thirdPlayers, ...playersInFirstRound];
                }
              });

              setSelectedPlayers(mainPlayers);
              setSelectedThirdPlayers(thirdPlayers);
            } else {
              setSelectedPlayers([]); // ステップラダーが空の場合はリセット
            }


          }
        } catch (error) {
          console.error("データの取得に失敗しました:", error);
        }finally {
          setLoading(false); // ローディング終了
          setLoading2(false);
        }
      } else {
        setParticipants([]);
        setStepLadders([]); // ステップラダーもリセット
        setLoading(false);
        setLoading2(false);
      }
    };



    const fetchStepLadders = async (categoryUid: string) => {

      try {
        const stepLadderRes = await getStepLadders({ uid: categoryUid });

        if (stepLadderRes.success) {
          const fetchedStepLadders = stepLadderRes.stepLadders || [];
          setStepLadders(fetchedStepLadders);
        } else {
          console.error("ステップラダーの取得に失敗しました");
        }
      } catch (error) {
        console.error("エラー:", error);
      }
    };


    const handleStepLadderDeleted = async() => {
      fetchStepLadders(selectedCategory.uid); // 削除後に再取得
    };




    const onSubmit = async (data: StepLadderFirstFormData) => {
            try {
                const res = await createStepLadder({
                    accessToken: user.accessToken,
                    category_uid: selectedCategory.uid,
                    type: data.type,
                    players_order: data.players_order,
                });

                if (res.success) {
                    setStepLadders([...stepLadders, res.stepLadder]);
                    toast.success("step ladderを作成しました");

                } else {
                    toast.error("step ladderの作成を失敗しました");
                }
            } catch (error) {
              console.error("Error creating stepladder:", error);
            }
          };



    return (
        <>
        {/* Cover Photo Start */}
        <div className="cover-photo position-relative z-index-1 overflow-hidden">
          <div className="avatar-upload">
            <div className="avatar-edit">
            </div>
            <div className="avatar-preview" style={{ backgroundImage: `url("/assets/images/logo/arnaud-girault-nGVax1ID3fI-unsplash.jpg")` }}>
              <div id="imagePreviewTwo"></div>
            </div>
          </div>
        </div>
        {/* Cover Photo End */}
        <div className="dashboard-body__content profile-content-wrapper z-index-1 position-relative mt--100">
          <h5 className="text-white" >
                  大会名・カテゴリーを選択
          </h5>
          <div className="row gy-4 ">

            <div className="col-lg-6">
              <div className="profile-sidebar ">
                <div className="profile-sidebar__item border  bg-white mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">大会名</h6>
                    <div className="welcome-balance__right flx-align gap-2">
                        <span className="fw-300">
                            総大会数
                        </span>
                        <h4 className="mb-0 text-primary">{tournaments.length}</h4>
                    </div>
                  </div>

                  <div className="select-has-icon">
                    <select
                      className="common-input"
                      defaultValue=""
                      onChange={handleTournamentChange}
                    >
                      <option value="" disabled>
                        大会を選択してください
                      </option>
                      {tournaments.map((tournament) => (
                        <option key={tournament.uid} value={tournament.uid}>
                          {tournament.name}【{tournament.start_date.slice(0, 4)}】
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="profile-sidebar">
                <div className="profile-sidebar__item border bg-white mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">カテゴリー</h6>
                    <div className="welcome-balance__right flx-align gap-2">
                        <span className="fw-300">
                            総カテゴリー数
                        </span>
                        <h4 className="mb-0 text-primary">{categories.length}</h4>
                    </div>
                  </div>
                  <div className="select-has-icon">
                    <select className="common-input" value={selectedCategory.uid} onChange={handleCategoryChange}>
                      <option value="" disabled>
                        カテゴリーを選択してください
                      </option>
                      {categories.map((category) => (
                        <option key={category.uid} value={category.uid}>
                          【{category.match_type}】{category.gender}{category.weight}{category.name}

                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* Profile Content Start */}
          <div className="profile">
            <div className="row gy-4">
              <div className="col-xxl-3 col-xl-4">

                    {loading ? (
                      // ローディング中の表示
                      <div className="text-center my-4">
                          <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                          </div>
                      </div>
                      ) : (
                          <div className="card common-card">
                            {participants.map((participant, index) => {
                              const isSelected = selectedPlayers.some(
                                (selectedPlayer) => selectedPlayer.id === participant.id
                              );
                              return (
                                <div
                                  className="card-body p-1"
                                  key={index}
                                  style={{
                                    opacity: isSelected ? 1 : 0.3, // selectedPlayers に含まれる場合は opacity: 1、それ以外は 0.5
                                  }}
                                >
                                  <div className="follow-wrapper p-1 d-flex ">
                                    <div className="follow-item">
                                      <div className="row">
                                        <div className="col">
                                          <h6 className="m-0">{index + 1}</h6>
                                        </div>
                                      </div>
                                      {loserIds.some((loser) => loser.id === participant.id) ? (
                                        <>
                                          <div className="text-danger">
                                            <p className="mb-0 fw-bold fst-italic">{participant.name}</p>
                                          </div>
                                          <div className="text-danger">
                                            <p className="mb-0 fs-6">【{participant.dojo}】</p>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-dark">
                                            <p className="mb-0 fw-bold fst-italic">{participant.name}</p>
                                          </div>
                                          <div className="text-dark">
                                            <p className="mb-0 fs-6">【{participant.dojo}】</p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          </div>

                    )}


                </div>

              <div className="col-xxl-9 col-xl-8">
                <div className={`dashboard-card ${!selectedCategory?.uid ? "opacity-50" : ""}`}>
                  <div className="dashboard-card__header  row d-flex align-items-center">
                    <h3 className="fw-700 font-24 col-6">トーナメント作成</h3>
                    <div className="col-6 d-flex justify-content-end">
                    <StepLadderFirstForm
                      selectedCategoryUid={selectedCategory.uid}
                      onSubmit={onSubmit}
                      isHonSenExist={isHonSenExist}
                      isThirdExist={isThirdExist}
                    />
                    </div>
                  </div>
                  <div className="profile-info-content row">
                    {loading2 ? (
                        // ローディング中の表示
                        <div className="text-center my-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        ) : (
                          <>
                            {stepLadders && stepLadders.length > 0 ? (
                              <>
                              {stepLadders.map((stepLadder, index) => (
                                <div className="row my-4" key={index}>
                                  <div className="col-12 d-flex justify-content-start align-items-center">
                                    <div>
                                      <h4 className="fst-italic mb-0">ー {stepLadder.type} ー</h4>
                                    </div>

                                  </div>
                                  <StepLadderGenerator
                                    user={user}
                                    matCount={selectedTournament?.mat_count}
                                    stepLadderUid={stepLadder.uid}
                                    stepLadderType={stepLadder.type}
                                    stepLadderConfirmed={stepLadder.confirmed}
                                    stepLadderPlayersOrder={stepLadder.players_order}
                                    participants={participants}
                                    setParticipants={setParticipants}
                                    selectedPlayers={selectedPlayers}
                                    selectedThirdPlayers={selectedThirdPlayers}
                                    setSelectedPlayers={setSelectedPlayers}
                                    setSelectedThirdPlayers={setSelectedThirdPlayers}
                                    onDelete={handleStepLadderDeleted}
                                    loserIds={loserIds}
                                    thirdLoserIds={thirdLoserIds}
                                    honsenStepladderUid={honsenStepladderUid}
                                    setLoserIds={setLoserIds}
                                    setThirdLoserIds={setThirdLoserIds}
                                  />
                                  <div className="col-12">

                                  </div>


                                </div>


                              ))}
                              </>


                            ) : (
                              // stepLadders が存在しない場合
                              <div>
                                <span className="fw-500">トーナメント表はまだありません</span>
                              </div>
                            )}
                           </>




                      )}


                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Profile Content End */}
        </div>
      </>

    );
}

export default CreateStepLadder;
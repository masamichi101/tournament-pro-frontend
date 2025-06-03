"use client";

import { getTournamentsByUserAccount, getTournamentCategoryList, getTournamentCategoryListByUserAccount} from "@/action/tournament";
import React,{useEffect,useState} from "react";
import ParticipantsForm from "./form/ParticipantsForm";
import { addParticipant, deletePlayer, getPlayersList } from "@/action/participants";
import { FaTrashAlt } from "react-icons/fa";
import ConfirmationModal from "./modal/deleteModal";
import { UserType } from "lib/nextauth";
import toast from "react-hot-toast";

interface ParticipantsFormData {
  tournamentCategoryUid: string;
  name: string;
  dojo:string;
  zenjuren_id:number | null;
  gender:string;

}

const ParticipantsList = ({ user }: { user: UserType }) => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ uid: "", gender: "" });
  const [participants, setParticipants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isTournamentsLoading, setIsTournamentsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);



  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setIsTournamentsLoading(true);
        const tournamentRes = await getTournamentsByUserAccount(user.accessToken);
        if (tournamentRes.success) {
          setTournaments(tournamentRes.tournaments || []);
        }
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }finally {
        setIsTournamentsLoading(false); // ← 追加
      }
    };
    fetchTournamentData();
  }, []);

  const handleTournamentChange = async (event) => {
    const selectedUid = event.target.value;
    setSelectedTournament(selectedUid);
    setSelectedCategory({ uid: "", gender: "" });
    setParticipants([]);


    if (selectedUid) {
      try {
        setIsCategoriesLoading(true);
        const categoryRes = await getTournamentCategoryListByUserAccount({ uid: selectedUid, accessToken: user.accessToken });

        if (categoryRes.success) {
          setCategories(categoryRes.categories || []);
        }
      } catch (error) {
        console.error("カテゴリーの取得に失敗しました:", error);
      }finally {
        setIsCategoriesLoading(false); // ← 追加
      }

    } else {
      setCategories([]);
    }
  };

  const handleCategoryChange = async (event) => {
    setLoading(true)
    const selectedUid = event.target.value;
    const selectedCategoryObj = categories.find(category => category.uid === selectedUid);

    setSelectedCategory(selectedCategoryObj || { uid: "" });

    if (selectedUid) {
      try {
        const playerRes = await getPlayersList({ uid: selectedUid });
        if (playerRes.success) {
          setParticipants(playerRes.players || []);
        }
      } catch (error) {
        console.error("プレイヤーの取得に失敗しました:", error);
      }finally {
        setLoading(false);
      }
    } else {
      setParticipants([]);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedPlayer) {
      const res = await deletePlayer({playerId:selectedPlayer.id,accessToken:user.accessToken});
      if (res.success) {
        setParticipants(participants.filter((participant) => participant.id !== selectedPlayer.id));
        toast.success("プレーヤーを削除しました");
      } else {
        toast.error("プレーヤーを削除できませんでした");
      }
      setIsModalOpen(false); // モーダルを閉じる
      setSelectedPlayer(null); // 選択をリセット
    }
  };

  const handleDeleteConfirmation = (player) => {
    setSelectedPlayer(player); // 削除対象を設定
    setIsModalOpen(true); // モーダルを表示
  };

  const onSubmit = async (data: ParticipantsFormData) => {
      try {

          const res = await addParticipant({
              accessToken: user.accessToken,
              tournamentCategoryUid: selectedCategory.uid,
              name: data.name,
              dojo: data.dojo,
              zenjuren_id: data.zenjuren_id,
              gender:data.gender,
      });

          if (res.success) {
              setParticipants([...participants, res.participant]);
              toast.success("プレーヤーを追加しました");

          } else {
            toast.error("プレーヤー追加に失敗しました");

          }
      } catch (error) {
        console.error("Error creating player:", error);
        toast.error("エラーが発生しました");

      }
    };

    const sortedParticipants = [...participants].sort((a, b) => {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });



  return (
    <div className="dashboard-body__content">
      <h5 className="">
              大会名・カテゴリーを選択
      </h5>
      <div className="row gy-4 ">

        <div className="col-lg-6">
          <div className="profile-sidebar">
            <div className="profile-sidebar__item ">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">大会名</h6>
                <div className="welcome-balance__right flx-align gap-2">
                <span className="fw-300">総大会数</span>
                  {isTournamentsLoading ? (
                    <div className="spinner-border spinner-border-sm text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <h4 className="mb-0 text-primary">{tournaments.length}</h4>
                  )}
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
            <div className="profile-sidebar__item">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">カテゴリー</h6>
                <div className="welcome-balance__right flx-align gap-2">
                    <span className="fw-300">
                        総カテゴリー数
                    </span>
                    {isCategoriesLoading ? (
                      <div className="spinner-border spinner-border-sm text-secondary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <h4 className="mb-0 text-primary">{categories.length}</h4>
                    )}
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
      <div
      className={`card common-card border border-gray-five overflow-hidden mb-24 ${!selectedCategory.uid ? "opacity-50" : ""}`}
      id="personalInfo"
      >
          <div className="card-header">
            <h6 className="title">参加者追加</h6>
          </div>
          <div className="card-body">
            <ParticipantsForm onSubmit={onSubmit} tournamentCategoryUid={selectedCategory?.uid || ""} />
          </div>
      </div>
      <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">参加者</h6>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-300">並び順</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "120px" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="asc">昇順</option>
              <option value="desc">降順</option>
            </select>
          </div>
        <div className="welcome-balance__right flx-align gap-2">
            <span className="fw-300">
                総参加者数
            </span>
            <h4 className="mb-0 text-primary">{participants.length}</h4>
        </div>
      </div>
      {loading ? (
                        // ローディング中の表示
                        <div className="text-center my-4">
                            <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
        ) : (
          <div className="card common-card">
            {sortedParticipants.map((participant, index) => (
              <div className="card-body p-1" key={index}>
                <div className="follow-wrapper p-1">
                  <div className="follow-item">
                    <div className="col-2 row" >
                      <div className="col d-flex flex-column justify-content-center align-items-center">
                      <h6 className="m-0">
                        {sortOrder === "asc"
                          ? index + 1
                          : sortedParticipants.length - index}
                      </h6>
                      </div>
                      <div className="col ">
                      <img
                        src={
                          selectedCategory.gender === "男子"
                            ? "/assets/images/icons/judoka-man.png"
                            : selectedCategory.gender === "女子"
                            ? "/assets/images/icons/judoka-woman.png"
                            : "/assets/images/icons/judoka-person.png"
                        }
                        alt="Judoka"
                      />
                      </div>
                    </div>
                    <div className="follow-item__sales col-5">
                      <div className="sales">
                        <h6 className="sales__amount mb-0 font-body">{participant.name}</h6>
                      </div>
                    </div>
                    <div className="follow-item__sales col-3">
                      <div className="sales">
                        <h6 className="sales__amount mb-0 font-body">{participant.dojo}</h6>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteConfirmation(participant)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>

      )}

    <ConfirmationModal
        isOpen={isModalOpen}
        title="削除の確認"
        message={`本当に ${selectedPlayer?.name} を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
    />
  </div>

  );
}

export default ParticipantsList;
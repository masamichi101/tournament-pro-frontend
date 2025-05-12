

'use client'
import {createTournamentCategory, deleteTournamentCategoryPermanently, getTournament, getTournamentCategoryDeletedList, getTournamentCategoryList, getTournamentCategoryListByUserAccount, toggleDeleteTournamentCategory, updateTournament} from '@/action/tournament';
import React, { useEffect, useState } from 'react';

import TournamentCategoryForm from './form/TournamentCategoryForm';
import { UserType } from 'lib/nextauth';
import toast from "react-hot-toast";
import { FaTrash } from 'react-icons/fa';
import ConfirmModal from './modal/ConfirmModal';
import TrashCategoryModal from './modal/TrashCategoryModal';

import "../../public/assets/css/bootstrap-btn.css";
import TournamentEditModal from './modal/TournamentEditModal';

import { MdOutlineDateRange } from "react-icons/md";
import { FaRegMap } from "react-icons/fa";
import { AiFillAppstore } from "react-icons/ai";


interface TournamentCategoryFormData {
    tournamentUid: string;
    name: string;
    match_type: string;
    gender: string;
    weight: string | null;
    match_day: string | null;
}
interface TournamentCategory {
    uid: string;
    match_type: string;
    gender: string;
    weight: string;
    name: string;

    match_day?: string | null;
    is_deleted: boolean;
  }
interface TournamentCategoryListProps {
    uid: string; // 親コンポーネントから渡されるトーナメント UID
    user:UserType;
  }
export interface Tournament {
    uid: string;
    name: string;
    prefecture: string;
    venue: string;
    start_date: string;
    end_date: string | null;
    mat_count: number;
    image?:string | File; // 画像の型をFileまたはstringに変更
  }

const TournamentCategoryList = ({uid,user}:TournamentCategoryListProps) => {


      const [categories, setCategories] = useState<TournamentCategory[]>([]);
      const [tournament, setTournament] = useState<Tournament | null>(null);
      const [loading, setLoading] = useState(true);

      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [selectedCategory, setSelectedCategory] = useState<TournamentCategory | null>(null);

      const [showTrashModal, setShowTrashModal] = useState(false);
      const [deletedCategories, setDeletedCategories] = useState<TournamentCategory[]>([]);
      const [loadingTrash, setLoadingTrash] = useState(false);

      const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<TournamentCategory | null>(null);
      const [showPermanentConfirmModal, setShowPermanentConfirmModal] = useState(false);

      const [showEditModal, setShowEditModal] = useState(false);
      const [editTarget, setEditTarget] = useState<Tournament | null>(null);

      const [base64Image, setBase64Image] = useState<string | null>(null);






      useEffect(() => {
        const fetchTournamentsData = async () => {
            setLoading(true)
            try{
              const tournamentRes = await getTournament({ accessToken: user.accessToken, uid });
              console.log("tournamentRes.tournament", tournamentRes.tournament);
              const tournamentsDetailRes = await getTournamentCategoryList({ uid: uid});
              if(tournamentsDetailRes.success && tournamentRes.success){
                setCategories(tournamentsDetailRes.categories || [])
                setTournament(tournamentRes.tournament || null)
              }
            }catch(error){
              console.error("Failed to fetch comments data:", error)
            }finally {
              setLoading(false);
            }
          }
          fetchTournamentsData();
      }, []);



      const onSubmit = async (data: TournamentCategoryFormData) => {
        try {

            const res = await createTournamentCategory({
                accessToken: user.accessToken,
                tournamentUid: uid,
                name: data.name,
                match_type: data.match_type,
                gender: data.gender,
                weight: data.weight,
                match_day: new Date().toISOString().split("T")[0],
        });

            if (res.success) {
                setCategories([...categories, res.category]);
                toast.success("カテゴリーを作成しました");

            } else {
                toast.error("カテゴリーの作成を失敗しました");
            }
        } catch (error) {
          console.error("Error creating tournament:", error);
        }
      };


      const handleConfirmDelete = async () => {
        if (!selectedCategory) return;

        const res = await toggleDeleteTournamentCategory({
          accessToken: user.accessToken,
          uid: selectedCategory.uid,
        });

        if (res.success) {
          setCategories(prev => prev.filter(c => c.uid !== selectedCategory.uid));
          toast.success("カテゴリーをゴミ箱に移動しました");
        } else {
          toast.error("削除に失敗しました");
        }

        setShowConfirmModal(false);
        setSelectedCategory(null);
      };

      const openTrashModal = async () => {
        setShowTrashModal(true);
        setLoadingTrash(true);
        try {
          const res = await getTournamentCategoryDeletedList({ uid,accessToken: user.accessToken, });
          if (res.success) {
            setDeletedCategories(res.categories || []);
          }
        } catch (err) {
          console.error("ゴミ箱一覧の取得に失敗しました", err);
        } finally {
          setLoadingTrash(false);
        }
      };

      const handleRestore = async (category: TournamentCategory) => {
        const res = await toggleDeleteTournamentCategory({
          accessToken: user.accessToken,
          uid: category.uid,
        });
        if (res.success) {
          setDeletedCategories(prev => prev.filter(c => c.uid !== category.uid));
          setCategories(prev => [...prev, category]);
          toast.success("カテゴリーを復元しました");
        } else {
          toast.error("復元に失敗しました");
        }
      };


      const handleConfirmPermanentDelete = async () => {
        if (!permanentDeleteTarget) return;

        const res = await deleteTournamentCategoryPermanently({
          accessToken: user.accessToken,
          uid: permanentDeleteTarget.uid,
        });

        if (res.success) {
          setDeletedCategories(prev => prev.filter(c => c.uid !== permanentDeleteTarget.uid));
          toast.success("完全に削除しました");
        } else {
          toast.error("完全削除に失敗しました");
        }

        setShowPermanentConfirmModal(false);
        setPermanentDeleteTarget(null);
      };


      const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const res = await updateTournament({
            accessToken: user.accessToken,
            uid: tournament.uid,
            updatedFields: { image: base64 },
          });
          if (res.success) {
            setTournament(res.tournament); // 最新画像に更新
            toast.success("画像を更新しました");
          } else {
            toast.error("画像の更新に失敗しました");
          }
        };
        reader.readAsDataURL(file);
      };







    return (
        <div className="dashboard-body__content">
          {editTarget && (
            <TournamentEditModal
              show={showEditModal}
              tournament={editTarget}
              onClose={() => setShowEditModal(false)}
              onSave={(updated) => {
                updateTournament({
                  accessToken: user.accessToken,
                  uid: tournament.uid,
                  updatedFields: { image: base64Image },
                }).then(res => {
                  if (res.success) {
                    setTournament(res.tournament);
                    toast.success("トーナメントを更新しました");
                  } else {
                    toast.error("更新に失敗しました");
                  }
                });
              }}
            />
          )}

          {tournament && (
              <div className=" mb-4">
                <div className="profile-info">
                  <div className="profile-info__inner mb-40 text-center">
                    <div className="avatar-upload mb-24">
                      <div className="avatar-edit">
                        {/* 画像変更用：後で連携可 */}
                        <input type="file" id="imageUpload" onChange={handleImageUpload} accept=".png, .jpg, .jpeg" />
                        <label htmlFor="imageUpload">
                          <img src="/assets/images/icons/camera.svg" alt="" />
                        </label>
                      </div>
                      <div className="avatar-preview">
                        <div id="imagePreview">
                          <img
                            src={typeof tournament.image === "string" ? tournament.image : tournament.image ? URL.createObjectURL(tournament.image) : "/assets/images/default-avatar.png"}
                            alt="Tournament"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "50%",
                              display: "block",
                            }}
                          />
                        </div>
                      </div>

                    </div>
                    <h5 className="profile-info__name mb-1">{tournament.name}</h5>
                    <span className="profile-info__designation font-14">
                      {tournament.prefecture}開催
                    </span>
                  </div>
                  <ul className="profile-info-list">
                    <li className="profile-info-list__item">
                      <span className="profile-info-list__content flx-align gap-2">
                        <FaRegMap />
                        <span className="text text-heading fw-500">会場</span>
                      </span>
                      <span className="profile-info-list__info">{tournament.venue}</span>
                    </li>
                    <li className="profile-info-list__item">
                      <span className="profile-info-list__content flx-align gap-2">
                        <MdOutlineDateRange />
                        <span className="text text-heading fw-500">開催日</span>
                      </span>
                      <span className="profile-info-list__info">
                        {tournament.start_date} ～ {tournament.end_date || "未定"}
                      </span>
                    </li>
                    <li className="profile-info-list__item">
                      <span className="profile-info-list__content flx-align gap-2">
                        <AiFillAppstore />
                        <span className="text text-heading fw-500">畳数</span>
                      </span>
                      <span className="profile-info-list__info">{tournament.mat_count}面</span>
                    </li>
                  </ul>
                  <div className="w-100 d-flex justify-content-end px-3">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setEditTarget(tournament);
                        setShowEditModal(true);
                      }}
                    >
                      編集
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* welcome balance Content Start */}
            <div className="welcome-balance mt-2 mb-40 flx-between gap-2">
                <div className="welcome-balance__left">
                <h4 className="welcome-balance__title mb-0">
                  {tournament?.name || "大会名取得中..."}【{tournament?.start_date ? tournament.start_date.slice(0, 4) : "----"}】カテゴリー
                </h4>

                </div>
                <div className="welcome-balance__right flx-align gap-2">
                    <span className="welcome-balance__text fw-500 text-heading">
                        総カテゴリー数
                    </span>
                    <h4 className="welcome-balance__balance mb-0">{categories.length}</h4>
                </div>
            </div>
            {/* welcome balance Content End */}
            <div className="dashboard-body__item-wrapper">
                <div
                className="card common-card border border-gray-five overflow-hidden mb-24"
                id="personalInfo"
                >
                    <div className="card-header">
                      <h6 className="title">カテゴリー作成</h6>
                    </div>
                    <div className="card-body">
                    {tournament ? (
                      <TournamentCategoryForm
                        onSubmit={onSubmit}
                        tournamentUid={uid}
                        tournamentStart={tournament.start_date}
                        tournamentEnd={tournament.end_date}
                      />
                    ) : (
                      <div>読み込み中...</div> // or null
                    )}
                    </div>
                </div>
                {/* dashboard body Item Start */}
                <div className="dashboard-body__item">
                    {loading ? (
                        // ローディング中の表示
                        <div className="text-center my-4">
                            <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        ) : (
                        // トーナメントカード一覧
                        <div className="row gy-4">
                            {categories.map((category, index) => (
                            <div className="col-xl-3 col-sm-6" key={index}>
                                <div className="dashboard-widget">
                                <img
                                    src="/assets/images/shapes/widget-shape1.png"
                                    alt=""
                                    className="dashboard-widget__shape one"
                                />
                                <img
                                    src="/assets/images/shapes/widget-shape2.png"
                                    alt=""
                                    className="dashboard-widget__shape two"
                                />

                                <div className="dashboard-widget__content ">
                                    <div
                                    className="w-100"
                                    style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    >

                                    </div>
                                    <span className={"font-14 m-1 px-2 py-3 btn btn-warning"}>
                                      {category.match_day
                                        ? `${new Date(category.match_day).getMonth() + 1}/${new Date(category.match_day).getDate()}`
                                        : "-"}
                                    </span>
                                    <span className={`font-14 m-1 px-2 py-3 ${
                                       category.match_type === "個人戦"? "btn btn-secondary": "btn btn-dark"}`}>
                                    {category.match_type}
                                    </span>
                                    <span
                                      className={`font-14 m-1 px-2 py-3 ${
                                        category.gender === "男子"
                                          ? "btn btn-primary"
                                          : category.gender === "女子"
                                          ? "btn btn-pink"
                                          : category.gender === "混合"
                                          ? "btn btn-warning"
                                          : ""
                                      }`}
                                    >
                                    {category.gender}
                                    </span>
                                    {category.weight && (
                                      <span
                                      className={`font-14 m-1 px-2 py-3 ${
                                        category.gender === "男子"
                                          ? "btn btn-primary"
                                          : category.gender === "女子"
                                          ? "btn btn-pink"
                                          : category.gender === "混合"
                                          ? "btn btn-warning"
                                          : ""
                                      }`}
                                      >
                                      {category.weight}
                                      </span>
                                    )}
                                </div>
                                  <h4
                                    className="dashboard-widget__number mb-1 mt-3"
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {category?.name || "-"}
                                  </h4>
                                  <div className="position-relative">
                                    {/* ...省略... */}

                                    {/* ゴミ箱アイコンボタン */}
                                    <span
                                      onClick={() => {
                                        setSelectedCategory(category);
                                        setShowConfirmModal(true);
                                      }}
                                      className="position-absolute rounded-pill d-flex justify-content-center align-items-center bg-danger text-white"
                                      style={{
                                        bottom: "5px",
                                        right: "5px",
                                        width: "24px",
                                        height: "24px",
                                        fontSize: "10px",
                                        border: "1px solid #ccc",
                                      }}
                                      title="ゴミ箱に移動"
                                    >
                                      <FaTrash size={10} />
                                    </span>

                                  </div>


                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                        <button className="btn btn-info my-3" onClick={openTrashModal}>
                          ゴミ箱を表示
                        </button>
                </div>



            </div>
            <ConfirmModal
              show={showConfirmModal}
              title="カテゴリー削除の確認"
              message={`「${selectedCategory?.match_type || ""}${selectedCategory?.gender || ""}${selectedCategory?.weight || ""}${selectedCategory?.name || ""}」をゴミ箱に移動してもよろしいですか？`}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setShowConfirmModal(false);
                setSelectedCategory(null);
              }}
            />
            <ConfirmModal
              show={showPermanentConfirmModal}
              title="完全削除の確認"
              message={`「${permanentDeleteTarget?.match_type || ""}${permanentDeleteTarget?.gender || ""}${permanentDeleteTarget?.weight || ""}${permanentDeleteTarget?.name || ""}」を完全に削除します。元に戻せません。本当によろしいですか？`}
              onConfirm={handleConfirmPermanentDelete}
              onCancel={() => {
                setShowPermanentConfirmModal(false);
                setPermanentDeleteTarget(null);
              }}
            />
            <TrashCategoryModal
              show={showTrashModal}
              onClose={() => setShowTrashModal(false)}
              deletedCategories={deletedCategories}
              loading={loadingTrash}
              onRestore={handleRestore}
              onPermanentDelete={(category) => {
                setPermanentDeleteTarget(category);
                setShowPermanentConfirmModal(true);
              }}

            />

        </div>
    );
}

export default TournamentCategoryList;


'use client'
import {createTournamentCategory, getTournament, getTournamentCategoryList, getTournamentCategoryListByUserAccount} from '@/action/tournament';
import React, { useEffect, useState } from 'react';

import TournamentCategoryForm from './form/TournamentCategoryForm';
import { UserType } from 'lib/nextauth';

interface Tournament {
  uid: string;
  name: string;
  start_date: string;
  end_date: string | null;
  venue: string;
}

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
  }
interface TournamentCategoryListProps {
    uid: string; // 親コンポーネントから渡されるトーナメント UID
    user:UserType;
  }


const TournamentCategoryList = ({uid,user}:TournamentCategoryListProps) => {


      const [categories, setCategories] = useState<TournamentCategory[]>([]);
      const [tournament, setTournament] = useState<Tournament | null>(null);
      const [loading, setLoading] = useState(true);




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
                alert("カテゴリーを作成しました");

            } else {
                alert("カテゴリーの作成を失敗しました");
            }
        } catch (error) {
          console.error("Error creating tournament:", error);
        }
      };







    return (
        <div className="dashboard-body__content">
            {/* welcome balance Content Start */}
            <div className="welcome-balance mt-2 mb-40 flx-between gap-2">
                <div className="welcome-balance__left">
                <h4 className="welcome-balance__title mb-0">
                  【{tournament?.name || "大会名取得中..."}】カテゴリー
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
                                          ? "btn btn-danger"
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
                                          ? "btn btn-danger"
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


                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                </div>

            </div>
        </div>
    );
}

export default TournamentCategoryList;
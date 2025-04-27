"use client";

import React, { useEffect, useState } from "react";
import { getTournamentsByUserAccount, getTournamentCategoryList } from "@/action/tournament";
import { UserType } from "lib/nextauth";
import { Tournament, Category } from "@/action/tournament";
import MatchOrderByDate from "./MatchOrderByDate";

const MatchOrder = ({ user }: { user: UserType }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [categoriesByDate, setCategoriesByDate] = useState<{ [date: string]: Category[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const tournamentRes = await getTournamentsByUserAccount(user.accessToken);
        if (tournamentRes.success && tournamentRes.tournaments) {
          setTournaments(tournamentRes.tournaments);
          if (tournamentRes.tournaments.length > 0) {
            setSelectedTournament(tournamentRes.tournaments[0]);
          }
        }
      } catch (error) {
        console.error("トーナメントの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [user.accessToken]);

  useEffect(() => {
    if (!selectedTournament) return;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoryRes = await getTournamentCategoryList({ uid: selectedTournament.uid });
        if (categoryRes.success && categoryRes.categories) {
          const groupedCategories: { [date: string]: Category[] } = {};
          categoryRes.categories.forEach((category) => {
            const date = category.match_day;
            if (!groupedCategories[date]) {
              groupedCategories[date] = [];
            }
            groupedCategories[date].push(category);
          });
          setCategoriesByDate(groupedCategories);
          setSelectedDate(Object.keys(groupedCategories)[0] || null);
        }
      } catch (error) {
        console.error("カテゴリーの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedTournament]);

  const handleTournamentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUid = event.target.value;
    const tournament = tournaments.find((t) => t.uid === selectedUid) || null;
    setSelectedTournament(tournament);
    setCategoriesByDate({});
    setSelectedDate(null);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="dashboard-body__content">
      <h5 className="text-black">大会名・カテゴリーを選択</h5>
      <div className="row gy-4">
        <div className="col-lg-6">
          <div className="profile-sidebar">
            <div className="profile-sidebar__item border bg-white mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">大会名</h6>
                <div className="welcome-balance__right flx-align gap-2">
                  <span className="fw-300">総大会数</span>
                  <h4 className="mb-0 text-primary">{tournaments.length}</h4>
                </div>
              </div>
              <div className="select-has-icon">
                <select className="common-input" value={selectedTournament?.uid || ""} onChange={handleTournamentChange}>
                  <option value="" disabled>
                    大会を選択してください
                  </option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.uid} value={tournament.uid}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        selectedTournament && (
          <>
            <div className="d-flex justify-content-center my-3">
            <ul
              className="nav nav-pills nav-fill gap-2 p-1 small bg-primary rounded-5 shadow-sm my-3"
              role="tablist"
              style={{
                '--bs-nav-link-color': 'var(--bs-white)',
                '--bs-nav-pills-link-active-color': 'var(--bs-primary)',
                '--bs-nav-pills-link-active-bg': 'var(--bs-white)',
              } as React.CSSProperties}
            >
              {Object.keys(categoriesByDate).map((date) => {
                const d = new Date(date);
                const formatted = `${d.getMonth() + 1}/${d.getDate()}`;
                const isActive = selectedDate === date;

                return (
                  <li className="nav-item" role="presentation" key={date}>
                    <button
                      className={`nav-link rounded-5 ${isActive ? 'active' : ''}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleDateChange(date)}
                    >
                      {formatted}
                    </button>
                  </li>
                );
              })}
            </ul>

            </div>
            {selectedDate && (
              <MatchOrderByDate
                user={user}
                categories={categoriesByDate[selectedDate]}
                matCount={selectedTournament.mat_count}
              />
            )}
          </>
        )
      )}
    </div>
  );
};

export default MatchOrder;

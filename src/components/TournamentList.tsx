

'use client'
import { createTournament, getTournamentsByUserAccount} from '@/action/tournament';
import React, { useEffect, useState,useRef} from 'react';
import { useForm } from 'react-hook-form';
import ImageUploading, { ImageListType } from "react-images-uploading";
import TournamentForm from './form/TournamentForm';
import Link from "next/link";
import { UserType } from 'lib/nextauth';
import LoadingModal from './modal/LoadingModal';
import toast from "react-hot-toast";



interface TournamentFormData {
    name: string;
    venue: string;
    image: string | null;
    prefecture: string;
    matCount: number;
    startDate: string;
    endDate: string | null;
}

const TournamentList = ({ user }: { user: UserType }) => {

    const formRef = useRef<{ resetForm: () => void }>(null);

      const [tournaments, setTournaments] = useState([]);
      const [imageUpload, setImageUpload] = useState<string | undefined>(undefined);
      const [loading, setLoading] = useState(false);
      const [creating, setCreating] = useState(false);



      useEffect(() => {
        const fetchTournamentsData = async () => {
            setLoading(true)
            try{
              const tournamentsRes = await getTournamentsByUserAccount(user.accessToken);


              if(tournamentsRes.success){
                console.log("tournamentsRes.tournaments",tournamentsRes.tournaments)
                setTournaments(tournamentsRes.tournaments || [])
              }
            }catch(error){
              console.error("Failed to fetch comments data:", error)
            }finally {
              setLoading(false);
            }
          }
          fetchTournamentsData();
      }, []);


      const onChangeImage = (imageList: ImageListType) => {
        const file = imageList[0]?.file;

        const maxFileSize = 2 * 1024 * 1024; // 2MB
        if (file && file.size > maxFileSize) {
          alert("ファイルサイズは2MBを超えることはできません");
          return;
        }

        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUpload(reader.result as string); // Base64 データをセット
          };
          reader.readAsDataURL(file);
        } else {
            setImageUpload(undefined); // 画像が削除された場合にリセット
          }
      };

      const onSubmit = async (data: TournamentFormData) => {
        setCreating(true);
        try {

            const res = await createTournament({
                accessToken:user.accessToken,
                name: data.name,
                venue: data.venue,
                image: imageUpload,
                mat_count: data.matCount,
                prefecture: data.prefecture,
                startDate: data.startDate,
                endDate: data.endDate,
        });

            if (res.success) {
                setTournaments([...tournaments, res.tournament]);
                toast.success("トーナメントを作成しました");
                formRef.current?.resetForm();
                setImageUpload(undefined);
            } else {
                toast.error("トーナメント作成に失敗しました");
            }
        } catch (error) {
          console.error("Error creating tournament:", error);
        }finally {
            setCreating(false); // ✅ トーナメント作成処理が完了したらローディング終了
          }
      };







    return (
        <div className="dashboard-body__content">
            {/* welcome balance Content Start */}
            <LoadingModal show={creating} />

            <div className="welcome-balance mt-2 mb-40 flx-between gap-2">
                <div className="welcome-balance__left">
                    <h4 className="welcome-balance__title mb-0">大会一覧</h4>
                </div>
                <div className="welcome-balance__right flx-align gap-2">
                    <span className="welcome-balance__text fw-500 text-heading">
                        総大会数
                    </span>
                    <h4 className="welcome-balance__balance mb-0">{tournaments.length}</h4>
                </div>
            </div>
            {/* welcome balance Content End */}
            <div className="dashboard-body__item-wrapper">
                <div
                className="card common-card border border-gray-five overflow-hidden mb-24"
                id="personalInfo"
                >
                    <div className="card-header">
                    <h6 className="title">大会作成</h6>
                    </div>
                    <div className="card-body">
                        <TournamentForm ref={formRef} onSubmit={onSubmit} imageUpload={imageUpload} onChangeImage={onChangeImage} />


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
                            {tournaments.map((tournament, index) => (
                            <Link key={index} href={`/tournament/${tournament.uid}`} passHref className="col-xl-3 col-sm-6 text-decoration-none">
                                <div key={index} >


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
                                        <span className="dashboard-widget__icon">
                                            <img
                                            src={tournament.image}
                                            alt=""
                                            className="dashboard-widget__icon"
                                            />
                                        </span>
                                        <div className="dashboard-widget__content flx-between gap-1 align-items-end">
                                            <div
                                            className="w-100"
                                            style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            >
                                            <h4
                                                className="dashboard-widget__number mb-1 mt-3"
                                                style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                }}
                                            >
                                                {tournament.name}
                                            </h4>
                                            </div>
                                            <span className="dashboard-widget__text font-14 text-dark">
                                            {tournament.venue}
                                            </span>
                                        </div>
                                        <span className="dashboard-widget__text font-14 text-dark">
                                            {tournament.start_date} - {tournament.end_date}
                                        </span>
                                        </div>

                                </div>
                            </Link>
                            ))}
                        </div>
                        )}
                </div>

            </div>
        </div>
    );
}

export default TournamentList;
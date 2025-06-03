import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";


interface ParticipantsFormData {
  tournamentCategoryUid: string;
  name: string;
  dojo:string;
  zenjuren_id:number | null;
  gender: string;

}

interface ParticipantsFormProps {
  onSubmit: (data: ParticipantsFormData) => void;
  tournamentCategoryUid: string;
  categoryGender?: string; // オプションのプロパティとして追加
}

const ParticipantsForm: React.FC<ParticipantsFormProps> = ({
  onSubmit,
  tournamentCategoryUid,
  categoryGender, // デフォルト値を空文字列に設定
}) => {
  const { register, handleSubmit,reset,setValue, formState: { errors } } = useForm<ParticipantsFormData>({
    defaultValues: {
      tournamentCategoryUid:tournamentCategoryUid,
      name: "",
      dojo:"",
      zenjuren_id:null,
      gender: "",

    },
  });

  useEffect(() => {
    if (!tournamentCategoryUid) return;
    if (categoryGender === "男子") {
      setValue("gender", "male");
    } else if (categoryGender === "女子") {
      setValue("gender", "female");
    } else {
      setValue("gender", ""); // その他または未定義
    }
  }, [categoryGender, tournamentCategoryUid, setValue]);



  const handleFormSubmit = (data: ParticipantsFormData) => {

    onSubmit(data); // 親コンポーネントの onSubmit を呼び出す
    reset(); // フォームをリセット
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="row gy-3">
        <div className="col-sm-6 col-xs-6">
          <label htmlFor="name" className="form-label">名前</label>
          <input
            type="text"
            className="common-input common-input--md border--color-dark bg--white"
            id="name"
            {...register("name", { required: "名前は必須です" })}
            disabled={!tournamentCategoryUid}
          />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="dojo" className="form-label">道場</label>
          <input
            type="text"
            className="common-input common-input--md border--color-dark bg--white"
            id="venue"
            {...register("dojo", { required: "道場は必須です" })}
            disabled={!tournamentCategoryUid}
          />
          {errors.dojo && <p className="text-danger">{errors.dojo.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="zenjuren_id" className="form-label">全柔連ID</label>
          <input
            type="text"
            className="common-input common-input--md border--color-dark bg--white"
            id="zenjuren_id"
            {...register("zenjuren_id", {
              validate: (value) =>
                value === null || value.toString() === "" || /^\d+$/.test(value.toString()) || "整数を入力してください",
            })}
            disabled={!tournamentCategoryUid}
          />
          {errors.zenjuren_id && (
            <p className="text-danger">{errors.zenjuren_id.message}</p>
          )}

        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="gender" className="form-label">性別</label>
          <select
            className="common-input common-input--md border--color-dark bg--white"
            id="gender"
            {...register("gender")}
            disabled={!tournamentCategoryUid}
          >
            <option value="">選択してください</option>
            <option value="male">男子</option>
            <option value="female">女子</option>
          </select>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary px-5" disabled={!tournamentCategoryUid}>作成</button>
        </div>
      </div>
  </form>
  );
};




export default ParticipantsForm;

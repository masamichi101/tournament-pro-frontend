import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { FaRegTrashAlt } from "react-icons/fa";

interface TournamentFormData {
  name: string;
  venue: string;
  image: File | null;
  prefecture: string;
  matCount: number;
  startDate: string;
  endDate: string;
}

interface TournamentFormProps {
  onSubmit: (data: TournamentFormData) => void;
  imageUpload: string | undefined;
  onChangeImage: (imageList: ImageListType) => void;
}

const prefectures = [
  "全国",
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];


const TournamentForm = forwardRef(({ onSubmit, imageUpload, onChangeImage }: TournamentFormProps, ref) => {
  const { register,handleSubmit,reset,watch,formState: { errors } } = useForm<TournamentFormData>({
    defaultValues: {
      name: "",
      venue: "",
      matCount: 1,
      startDate: "",
      endDate: "",
      prefecture: "全国",

    },
  });

  useImperativeHandle(ref, () => ({
    resetForm: () => reset(),
  }));

  const startDateValue = watch("startDate");

  const handleFormSubmit = (data: TournamentFormData) => {
    onSubmit(data); // 親コンポーネントの onSubmit を呼び出す
    reset(); // フォームをリセット
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="row gy-3">
        <div className="col-sm-6 col-xs-6">
          <label htmlFor="name" className="form-label">大会名</label>
          <input
            type="text"
            className="common-input common-input--md border--color-dark bg--white"
            id="name"
            {...register("name", { required: "大会名は必須です" })}
          />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="venue" className="form-label">会場</label>
          <input
            type="text"
            className="common-input common-input--md border--color-dark bg--white"
            id="venue"
            {...register("venue", { required: "会場は必須です" })}
          />
          {errors.venue && <p className="text-danger">{errors.venue.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="matCount" className="form-label">試合場の数</label>
          <input
            type="number"
            className="common-input common-input--md border--color-dark bg--white"
            id="matCount"
            {...register("matCount", { required: "試合場の数は必須です", min: 1 })}
          />
          {errors.matCount && <p className="text-danger">{errors.matCount.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="image" className="form-label">イメージ画像</label>
          <ImageUploading
            value={imageUpload ? [{ data_url: imageUpload }] : []}
            onChange={(imageList) => {
              if (imageList.length === 0) {
                onChangeImage([]); // 画像が削除されたら状態をリセット
              } else {
                onChangeImage(imageList); // 新しい画像リストを親コンポーネントに渡す
              }
            }}
            dataURLKey="data_url"
            acceptType={["jpg", "jpeg", "png"]}
            maxNumber={1}

          >
            {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
              <div className="common-input common-input--md border--color-dark bg--white">
                <button
                  type="button"
                  style={imageList.length === 0 ? {} : { display: "none" }}
                  onClick={onImageUpload}
                  {...dragProps}
                  className="border px-3 py-1 border-rounded"
                >
                  ファイルを追加
                </button>
                {imageList.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image.data_url} alt=""  className=""/>
                    <button type="button" onClick={() => {
                      onImageRemove(index); // 画像リストから削除
                      onChangeImage([]); // 状態をリセット
                    }} className="mt-3">
                      <FaRegTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ImageUploading>
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="prefecture" className="form-label">開催県</label>
          <select
            id="prefecture"
            className="form-select common-input common-input--md border--color-dark bg--white"
            {...register("prefecture", { required: "開催県は必須です" })}
          >
            {prefectures.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
          {errors.prefecture && <p className="text-danger">{errors.prefecture.message}</p>}
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="startDate" className="form-label">開始日</label>
          <input
            type="date"
            className="common-input common-input--md border--color-dark bg--white"
            id="startDate"
            {...register("startDate", { required: "開始日は必須です" })}
          />
        </div>

        <div className="col-sm-6 col-xs-6">
          <label htmlFor="endDate" className="form-label">終了日</label>
          <input
            type="date"
            className="common-input common-input--md border--color-dark bg--white"
            id="endDate"
            {...register("endDate", {
              required: "終了日は必須です",
              validate: (endDate) =>
                !endDate || !startDateValue || new Date(endDate) >= new Date(startDateValue) || "終了日は開始日以降でなければなりません",
            })}
          />
          {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary px-5">作成</button>
        </div>
      </div>
    </form>
  );
});

export default TournamentForm;

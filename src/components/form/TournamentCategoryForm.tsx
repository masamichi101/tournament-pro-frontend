import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";


interface TournamentCategoryFormData {
  tournamentUid: string;
  name?:string | null;
  match_type: string;
  gender?: string | null;
  weight?: string | null;
  match_day: string;
}

interface TournamentCategoryFormProps {
  onSubmit: (data: TournamentCategoryFormData) => void;
  tournamentUid: string;
  tournamentStart:string;
  tournamentEnd:string;
}

const TournamentCategoryForm: React.FC<TournamentCategoryFormProps> = ({
  onSubmit,
  tournamentUid,
  tournamentStart,
  tournamentEnd
}) => {
  const { register, handleSubmit,watch,reset, formState: { errors } } = useForm<TournamentCategoryFormData>({
    defaultValues: {
      tournamentUid: tournamentUid,
      name: "",
      match_type: "",
      gender: "",
      weight: "",
      match_day: "",
    },
  });

  const matchTypes = ["団体戦", "個人戦"];
  const genders = ["男子", "女子", "混合"];
  const weightOptions = {
    男子: ["-50kg", "-55kg", "-60kg", "-66kg", "-73kg","-81kg","-90kg","-100kg","+100kg","+90kg","無差別"],
    女子: ["-44kg", "-48kg", "-52kg", "-57kg", "-63kg","-70kg","-78kg","+78kg","+70kg","無差別"],
  };
  // フォームで選択された値
  const selectedMatchType = watch("match_type");
  const selectedGender = watch("gender");

  // 動的に変更される weight の選択肢
  const [filteredWeights, setFilteredWeights] = useState<string[]>([]);
  const [availableMatchDays, setAvailableMatchDays] = useState<string[]>([]);

  useEffect(() => {

    const start = new Date(tournamentStart);
    const end = tournamentEnd ? new Date(tournamentEnd) : start;

    const days: string[] = [];
    const current = new Date(start);


    while (current <= end) {
      days.push(current.toISOString().split("T")[0]); // 'YYYY-MM-DD' 形式
      current.setDate(current.getDate() + 1);
    }

    setAvailableMatchDays(days);
  }, [tournamentStart, tournamentEnd]);

  useEffect(() => {
    if (selectedMatchType === "個人戦" && selectedGender) {
      setFilteredWeights(weightOptions[selectedGender] || []);
    } else {
      setFilteredWeights([]);
    }
  }, [selectedMatchType, selectedGender]);

  const handleFormSubmit = (data: TournamentCategoryFormData) => {
    onSubmit(data); // 親コンポーネントの onSubmit を呼び出す
    reset(); // フォームをリセット
  };

  return (
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="row gy-3">

          <div className="col-sm-6 col-xs-6">
            <label htmlFor="match_type" className="form-label">試合タイプ</label>
            <select
              id="match_type"
              className="common-input common-input--md border--color-dark bg--white"
              {...register("match_type", { required: "試合タイプを選択してください" })}
            >
              <option value="">選択してください</option>
              {matchTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.match_type && <p className="text-danger">{errors.match_type.message}</p>}
          </div>

          <div className="col-sm-6 col-xs-6">
            <label htmlFor="gender" className="form-label">性別</label>
            <select
              id="gender"
              className="common-input common-input--md border--color-dark bg--white"
              {...register("gender", { required: "性別を選択してください" })}
            >
              <option value="">選択してください</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
            {errors.gender && <p className="text-danger">{errors.gender.message}</p>}
          </div>

          {selectedMatchType === "個人戦" && selectedGender !== "混合" && (
            <div className="col-sm-6 col-xs-6">
              <label htmlFor="weight" className="form-label">体重カテゴリー</label>
              <select
                id="weight"
                className="common-input common-input--md border--color-dark bg--white"
                {...register("weight", { required: "体重カテゴリーを選択してください" })}
              >
                <option value="">選択してください</option>
                {filteredWeights.map((weight) => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
              {errors.weight && <p className="text-danger">{errors.weight.message}</p>}
            </div>
          )}
          <div className="col-sm-6 col-xs-6">
            <label htmlFor="name" className="form-label">カテゴリー名</label>
            <input
              type="text"
              className="common-input common-input--md border--color-dark bg--white"
              id="name"
              {...register("name")}
            />
            {errors.name && <p className="text-danger">{errors.name.message}</p>}
          </div>
          <div className="col-12">
            <label className="form-label">試合日</label>
            <div>
              {availableMatchDays.map((day) => (
                <div key={day} className="form-check form-check-inline">
                  <input
                    type="radio"
                    id={`match_day_${day}`}
                    value={day}
                    {...register("match_day", { required: "試合日を選択してください" })}
                    className="form-check-input"
                  />
                  <label htmlFor={`match_day_${day}`} className="form-check-label">
                    {day}
                  </label>
                </div>
              ))}
              {errors.match_day && <p className="text-danger">{errors.match_day.message}</p>}
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary px-5">作成</button>
          </div>
        </div>
      </form>
  );
};

export default TournamentCategoryForm;

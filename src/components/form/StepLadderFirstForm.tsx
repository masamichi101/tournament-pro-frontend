import React from "react";
import { useForm } from "react-hook-form";


interface StepLadderFirstFormData {
  type: string;
  stepLadderCount:number;
  playerCount?:number|null;
  players_order?:Record<string, string[]> | null;

}

interface StepLadderFirstFormProps {
  selectedCategoryUid: string;
  onSubmit: (data: StepLadderFirstFormData) => void;
  isHonSenExist?:boolean;
  isThirdExist?: boolean;
}

const StepLadderFirstForm: React.FC<StepLadderFirstFormProps> = ({
  selectedCategoryUid,
  onSubmit,
  isHonSenExist,
  isThirdExist
}) => {
  const { register, handleSubmit,reset, formState: { errors } } = useForm<StepLadderFirstFormData>({
    defaultValues: {
      type: "",
      stepLadderCount:4,
      playerCount:0,
      players_order:null,
    },
  });


  const handleFormSubmit = (data: StepLadderFirstFormData) => {
    onSubmit(data); // 親コンポーネントの onSubmit を呼び出す
    reset(); // フォームをリセット
  };

  return (

    <form onSubmit={handleSubmit(handleFormSubmit)}>
        <label htmlFor="match_type" className="form-label">
          用途タイプ
        </label>
        <div className="row">
          <div className="col-8">
            <select
              id="match_type"
              className="common-input common-input--md border--color-dark bg--white"
              {...register("type", { required: "用途タイプを選択してください" })}
              disabled={!selectedCategoryUid}
            >
              <option value="">選択してください</option>
              <option value="本戦" disabled={isHonSenExist}>本戦</option>
              <option value="3位決定戦" disabled={isThirdExist}>3位決定戦</option>
            </select>
            {errors.type && (
              <p className="text-danger">{errors.type.message}</p>
            )}
          </div>
          <button type="submit" className="btn btn-primary p-3 col-4" disabled={!selectedCategoryUid}>
            追加
          </button>
        </div>
    </form>


  );
};




export default StepLadderFirstForm;

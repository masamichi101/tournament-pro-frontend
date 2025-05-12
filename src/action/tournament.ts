"use server"





// 共通のAPIリクエスト
const fetchAPI = async (url: string, options: RequestInit) => {
  const apiUrl = process.env.API_URL

  if (!apiUrl) {
    return { success: false, error: "API URLが設定されていません" }
  }

  try {
    const response = await fetch(`${apiUrl}${url}`, options)

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error Data:", errorData);
      return { success: false, error:  `APIでエラーが発生しました: ${errorData.detail || errorData.message || '詳細不明'}`  }
    }

    // Content-Type ヘッダーが application/json の場合のみ、JSON を解析する
    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return { success: true, data }
    }

    // データなしで成功を返す
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "ネットワークエラーが発生しました" }
  }
}


export interface Tournament {
  id?: number;
  uid:string;
  name: string;
  venue: string;
  image: File | string | null;
  mat_count: number;
  prefecture: string;
  startDate: string;
  endDate: string|null;
  createdAt: string;
}

export const getTournaments =async (accessToken:string) =>{
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  const result = await fetchAPI("/api/tournaments/",options);
  if (!result.success) {
    console.error(result.error);
    return { success: false, tournaments:null};
  }

  const tournaments:Tournament[] = result.data;
  return { success: true, tournaments };
}

export const getTournament = async ({accessToken,uid}:{accessToken:string,uid:string} ) => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  const result = await fetchAPI(`/api/tournaments/get-by-uid/?uid=${uid}`, options);

  if (!result.success) {
    console.error(result.error);
    return { success: false, tournament: null };
  }

  return { success: true, tournament: result.data };
};


export const getTournamentsByUserAccount = async (accessToken: string) => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  const result = await fetchAPI("/api/tournaments/my-tournaments/", options);

  if (!result.success) {
    console.error(result.error);
    return { success: false, tournaments: null };
  }

  const tournaments: Tournament[] = result.data;
  return { success: true, tournaments };
};


interface CreateTournamentType {
  accessToken: string;
  name: string;
  venue: string;
  image: string | null;
  mat_count: number;
  prefecture: string;
  startDate: string;
  endDate: string | null;
}

export const createTournament = async ({
  accessToken,
  name,
  venue,
  image,
  mat_count,
  prefecture,
  startDate,
  endDate,
}: CreateTournamentType) => {
  const body = JSON.stringify({
    name:name,
    venue:venue,
    image:image||null,
    mat_count:mat_count,
    prefecture:prefecture,
    start_date:startDate,
    end_date:endDate,
  })
  const options: RequestInit = {
    method: "POST",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI("/api/tournaments/", options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, tournament: null };
    }

    return { success: true, tournament: response.data };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false, tournament: null };
  }
};


interface UpdateTournamentType {
  accessToken: string;
  uid: string;
  updatedFields: Partial<Omit<Tournament, "uid" | "createdAt" >>; // image除外
}

export const updateTournament = async ({
  accessToken,
  uid,
  updatedFields,
}: UpdateTournamentType) => {
  const body = JSON.stringify(updatedFields);

  const options: RequestInit = {
    method: "PATCH",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json", // ✅ これで JSON を指定
    },
    body,
  };

  try {
    const response = await fetchAPI(`/api/tournaments/${uid}/`, options);

    if (!response.success) {
      console.error("Update error:", response.error);
      return { success: false };
    }

    return { success: true, tournament: response.data };
  } catch (error) {
    console.error("Exception while updating tournament:", error);
    return { success: false };
  }
};




export interface Category {
  id?: number;
  uid:string;
  name: string;
  match_type: string;
  gender: string;
  weight:string;
  match_day?: string | null;
  created_at: string;
  is_deleted: boolean;


}

export const getTournamentCategoryList = async ({ uid }: { uid: string }) => {
  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  }

  // 投稿詳細取得
  const result = await fetchAPI(`/api/tournament/category-list/${uid}/`, options)


  if (!result.success) {
    console.error(result.error)
    return { success: false, categories: null }
  }

  const categories: Category[] = result.data

  return { success: true, categories}
}




export const getTournamentCategoryListByUserAccount = async ({ uid, accessToken }: { uid: string, accessToken: string }) => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization:`JWT ${accessToken}`, // ✅ JWTトークンを送る
      "Content-Type": "application/json",
    },
    cache: "no-store",
  }

  const result = await fetchAPI(`/api/tournament/my-categories/?tournament_uid=${uid}`, options);


  if (!result.success) {
    console.error(result.error);
    return { success: false, categories: null };
  }

  const categories: Category[] = result.data;

  return { success: true, categories };
};




interface CreateTournamentCategoryType {
  accessToken: string;
  tournamentUid: string;
  name: string;
  match_type: string;
  gender?: string | null;
  weight?: string | null;
  match_day?: string | null;
}

export const createTournamentCategory = async ({
  accessToken,
  tournamentUid,
  name,
  match_type,
  gender,
  weight,
  match_day,
}: CreateTournamentCategoryType) => {

  const body = JSON.stringify({
    tournament:tournamentUid,
    name:name,
    match_type:match_type,
    gender:gender||null,
    weight:weight||null,
    match_day:match_day||null,
  })
  const options: RequestInit = {
    method: "POST",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI("/api/tournament_categories/", options);

    if (!response.success) {
      console.error("Error:", response.error);
      console.error("Error Details:", response.error || "No error details provided");
      return { success: false, category: null };
    }

    return { success: true, category: response.data };
  } catch (error) {
    console.error("カテゴリーの作成に失敗しました:", error);
    return { success: false, category: null };
  }
};




interface ToggleDeleteCategoryType {
  accessToken: string;
  uid: string;
}

export const toggleDeleteTournamentCategory = async ({
  accessToken,
  uid,
}: ToggleDeleteCategoryType) => {
  const options: RequestInit = {
    method: "PATCH",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const result = await fetchAPI(`/api/tournament-category/${uid}/toggle-delete/`, options);

  if (!result.success) {
    console.error("toggleDeleteTournamentCategory error:", result.error);
    return { success: false };
  }

  return { success: true, is_deleted: result.data.is_deleted };
};




export const getTournamentCategoryDeletedList = async ({
  uid,
  accessToken,
}: {
  uid: string;
  accessToken: string;
})=> {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `JWT ${accessToken}`,
    },
    cache: "no-store",
  };

  // 投稿詳細取得
  const result = await fetchAPI(`/api/tournament/deleted-category-list/${uid}/`, options)


  if (!result.success) {
    console.error(result.error)
    return { success: false, categories: null }
  }

  const categories: Category[] = result.data

  return { success: true, categories}
}


export const deleteTournamentCategoryPermanently = async ({
  accessToken,
  uid,
}: ToggleDeleteCategoryType) => {
  const options: RequestInit = {
    method: "DELETE",
    headers: {
      Authorization: `JWT ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const result = await fetchAPI(`/api/tournament-category/${uid}/permanent-delete/`, options);

  if (!result.success) {
    console.error("deleteTournamentCategoryPermanently error:", result.error);
    return { success: false };
  }

  return { success: true };
};



export interface StepLadder {
  id?: number;
  uid:string;
  category_uid:string;
  type: string;
  confirmed: boolean;
  players_order: Record<string, string[]>;
}

export const getStepLadders = async ({ uid }: { uid: string }) => {
  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  }

  // 投稿詳細取得
  const result = await fetchAPI(`/api/tournament/step_ladders/category_by/${uid}/`, options)

  if (!result.success) {
    console.error(result.error)
    return { success: false, stepLadders: null }
  }

  const stepLadders: StepLadder[] = result.data

  return { success: true, stepLadders}
}


export const getStepLadder = async ({ uid }: { uid: string }) => {
  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  };

  // 単体の StepLadder を取得
  const result = await fetchAPI(`/api/step_ladder/get-by-uid/?uid=${uid}`, options);

  if (!result.success) {
    console.error(result.error);
    return { success: false, stepLadder: null };
  }

  return { success: true, stepLadder: result.data };
};



export interface CreateStepLadder {
  accessToken: string;
  category_uid:string;
  type: string;
  players_order: Record<string, string[]>;
}

export const createStepLadder= async ({
  accessToken,
  category_uid,
  type,
  players_order,
}: CreateStepLadder) => {

  const body = JSON.stringify({
    tournament_category:category_uid,
    type:type,
    players_order:players_order,
  })
  const options: RequestInit = {
    method: "POST",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI("/api/step_ladder/", options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, stepLadder: null };
    }

    return { success: true, stepLadder: response.data };
  } catch (error) {
    console.error("トーナメントの作成に失敗しました:", error);
    return { success: false, stepLadder: null };
  }
};


export interface UpdateStepLadder {
  accessToken:string;
  stepLadderUid:string;
  players_order: Record<string, string[]>;
}
export const updateStepLadder = async ({  accessToken,stepLadderUid, players_order,}: UpdateStepLadder) => {
  const body = JSON.stringify({
    players_order:players_order,
  })
  const options: RequestInit = {
    method: "PATCH",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI(`/api/step_ladder/${stepLadderUid}/update_players_order/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, stepLadder: null };
    }

    return { success: true, stepLadder: response.data };
  } catch (error) {
    console.error("step ladderの更新に失敗しました:", error);
    return { success: false, stepLadder: null };
  }
};


export interface toggleStepLadderConfirm {
  accessToken:string;
  stepLadderUid:string;
  confirmed:boolean;
}

export const toggleStepLadderConfirm = async ({  accessToken,stepLadderUid, confirmed,}: toggleStepLadderConfirm) => {
  const body = JSON.stringify({
    confirmed:confirmed,
  })
  const options: RequestInit = {
    method: "PATCH",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI(`/api/step_ladder/${stepLadderUid}/toggle_confirmed/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, stepLadder: null };
    }

    return { success: true, stepLadder: response.data };
  } catch (error) {
    console.error("step ladderのconfirmedの更新に失敗しました:", error);
    return { success: false, stepLadder: null };
  }
};



export interface ResetPlayersOrder {
  accessToken:string;
  stepLadderUid: string;
}

export const resetPlayersOrder = async ({ accessToken,stepLadderUid }: ResetPlayersOrder) => {
  const options: RequestInit = {
    method: "PATCH",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
  };

  try {
    const response = await fetchAPI(`/api/step_ladder/${stepLadderUid}/reset_players_order/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, players_order: null };
    }

    return { success: true, players_order: response.data.players_order };
  } catch (error) {
    console.error("players_order のリセットに失敗しました:", error);
    return { success: false, players_order: null };
  }
};




export interface CreateAllMatch {
  accessToken:string;
  stepLadderUid:string;
}

export const createAllMatch= async ({
  accessToken,stepLadderUid,
}: CreateAllMatch) => {

  const options: RequestInit = {
    method: "POST",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
  };

  try {
    const response = await fetchAPI(`/api/create-matches/${stepLadderUid}/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, matches: null };
    }

    return { success: true, matches: response.data };
  } catch (error) {
    console.error("対戦カードの作成に失敗しました:", error);
    return { success: false, matches: null };
  }
};


interface DeleteAllMatch {
  accessToken:string;
  stepLadderUid:string;
}
export const deleteAllMatch = async ({ accessToken,stepLadderUid }: DeleteAllMatch) => {
  const options: RequestInit = {
    method: "DELETE",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
  };

  try {
    const response = await fetchAPI(`/api/delete-matches/${stepLadderUid}/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, matches: null };
    }

    return { success: true, matches: response.data };
  } catch (error) {
    console.error("対戦カードの削除に失敗しました:", error);
    return { success: false, matches: null };
  }
}



export interface UpdateMatch {
  accessToken: string;
  matchId: string;
  step_ladder_uid?: string;
  level?: number;
  match_number?: number;
  mat?: number;
  match_order?: number;
  player1?: number | null;
  player2?: number | null;
  scores?: Record<string, string[]>;
  decision?: string | null;
  match_time?: string | null;
  live?: boolean;
  final?: boolean;
  winner?: number | null;
}

export const updateMatch = async ({
  accessToken,
  matchId,
  ...updateData
}: UpdateMatch) => {
  const body = JSON.stringify(updateData);


  const options: RequestInit = {
    method: "PATCH",
    headers:{
      Authorization: `JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {

    const response = await fetchAPI(`/api/matches/${matchId}/update-match/`, options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, match: null };
    }

    return { success: true, match: response.data };
  } catch (error) {
    console.error("試合の更新に失敗しました:", error);
    return { success: false, match: null };
  }
};





export interface Match {
  id?: number;
  name:string;
  step_ladder:string;
  step_ladder_uid: string;
  level: number;
  match_number: number;
  mat:number;
  match_order:number;
  player1?: {
    id: number;
    name: string;
    dojo: string;
    gender:string;
  } | null;
  player2?: {
    id: number;
    name: string;
    dojo: string;
    gender:string;
  } | null;
  winner?: {
    id: number;
    name: string;
    dojo: string;
    gender:string;
  } | null;
  scores?: Record<string, string[]>;
  decision?: string;
  match_time?: string;
  live?: boolean;
  final?: boolean;
}

export const getMatch = async ({
  step_ladder_uid,
  level,
  match_number,
}: {
  step_ladder_uid: string;
  level: number;
  match_number: number;
}) => {
  const queryParams = new URLSearchParams({
    step_ladder: step_ladder_uid,
    level: level.toString(),
    match_number: match_number.toString(),
  });

  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  };

  // 試合詳細取得
  const result = await fetchAPI(`/api/matches/get-match/?${queryParams.toString()}`, options);

  if (!result.success) {
    console.error(result.error);
    return { success: false, match: null };
  }

  const match: Match = result.data;

  return { success: true, match };
};

export interface getMatchesAll {
  stepLadderUid: string;
}

export const getMatchesAll = async ({ stepLadderUid }: getMatchesAll) => {
  const queryParams = new URLSearchParams({ step_ladder: stepLadderUid });

  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  };

  try {
    const result = await fetchAPI(`/api/matches/get-matches-all/?${queryParams.toString()}`, options);

    if (!result.success) {
      console.error("試合の取得に失敗しました:", result.error);
      return { success: false, matches: [] };
    }

    return { success: true, matches: result.data }; // ✅ 試合データを配列として返す
  } catch (error) {
    console.error("APIエラー:", error);
    return { success: false, matches: [] };
  }
};


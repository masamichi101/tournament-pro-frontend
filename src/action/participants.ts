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







interface AddParticipantType {
  accessToken: string;
  tournamentCategoryUid: string;
  name: string;
  dojo: string;
  zenjuren_id: number | null;
  gender: string;
}

export const addParticipant = async ({
  accessToken,
  tournamentCategoryUid,
  name,
  dojo,
  zenjuren_id,
  gender
}: AddParticipantType) => {
  const body = JSON.stringify({
    tournament_category: tournamentCategoryUid,
    name:name,
    dojo:dojo,
    zenjuren_id:zenjuren_id,
    gender:gender,
  })

  const options: RequestInit = {
    method: "POST",
    headers:{
      Authorization:`JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
    body,
  };

  try {
    const response = await fetchAPI("/api/player/", options);

    if (!response.success) {
      console.error("Error:", response.error);
      return { success: false, participant: null };
    }

    return { success: true, participant: response.data };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false, participant: null };
  }
};



export interface Player {
  id?: number;
  zenjuren_id?: number | null;
  name: string;
  dojo: string;
  loser: boolean;
  gender: number;
}

export const getPlayersList = async ({ uid }: { uid: string }) => {
  const options: RequestInit = {
    method: "GET",
    cache: "no-store",
  }

  // 投稿詳細取得
  const result = await fetchAPI(`/api/players-list/${uid}/`, options)



  if (!result.success) {
    console.error(result.error)
    return { success: false, categories: null }
  }

  const players: Player[] = result.data

  return { success: true, players}
}


export const deletePlayer = async ({playerId,accessToken}: {playerId:number,accessToken:string}) => {



  const options: RequestInit = {
    method: "DELETE",
    headers:{
      Authorization:`JWT ${accessToken}`,
      "Content-Type":"application/json",
    },
  };

  try {
    const response = await fetchAPI(`/api/player/${playerId}/`, options);
    if (!response.success) {
      console.error("Error deleting player:", response.error);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Network error while deleting player:", error);
    return { success: false };
  }
};
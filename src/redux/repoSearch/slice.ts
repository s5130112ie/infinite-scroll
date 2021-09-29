import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const { Octokit } = require("@octokit/core");

interface RepoSearchState {
    loading: boolean;
    error: string | null;
    data: any;
    hasMore: boolean;
}

const initialState: RepoSearchState = {
    loading: false,
    error: null,
    data: [],
    hasMore: true,
};

export const searchRepo = createAsyncThunk(
    "repoSearch/searchRepo",
    async (
        paramaters: {
            keywords: string;
            nextPage: number | string;
            pageSize: number | string;
        },
        thunkAPI
    ) => {
        const octokit = new Octokit({ auth: `` });
        const response = await octokit.request('GET /search/repositories', {
            q: paramaters.keywords,
            page: paramaters.nextPage,
            per_page: paramaters.pageSize
        });
        return {
            data: response.data,

            // 用查詢條件判斷 data清空與否, hasMore的判定
            page: paramaters.nextPage,
            per_page: paramaters.pageSize
        };
    }
);

export const repoSearchSlice = createSlice({
    name: "repoSearch",
    initialState,
    reducers: {},
    extraReducers: {
        [searchRepo.pending.type]: (state) => {
            state.loading = true;
        },
        [searchRepo.fulfilled.type]: (state, action) => {
            
            state.loading = false;
            state.error = null;
            
            // 查詢全新關鍵字時,為搜尋第一頁時,清空舊資料
            if (action.payload.page === 1) {
                state.data = action.payload.data.items
            } else {
                // 將新資料和舊資料混合
                state.data = [...state.data, ...action.payload.data.items];
            }
            
            if (action.payload.data.total_count === 0
                    || action.payload.page * action.payload.per_page >= action.payload.data.total_count) {
                // 查無資料時告知沒有資料了
                state.hasMore = false;
            } else {
                state.hasMore = true;
            }
        },
        [searchRepo.rejected.type]: (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        },
    },
});

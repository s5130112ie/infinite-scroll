import { combineReducers } from "@reduxjs/toolkit";
import { repoSearchSlice } from "./repoSearch/slice";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";

const reducers = combineReducers({
    repo: repoSearchSlice.reducer
});

export const store = createStore(reducers, applyMiddleware(thunk));
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

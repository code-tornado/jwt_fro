import { combineReducers } from "redux";
import authReducer from "./auth.reducer";
import { AUTH_ACTIONS } from "../action-types";

const appReducer = combineReducers({
  authReducer,
});

export const rootReducer = (state, action) => {
  if (action.type === AUTH_ACTIONS.SET_ACCOUNT && !action.payload) {
    return appReducer({}, action);
  }

  return appReducer(state, action);
};

export default rootReducer;

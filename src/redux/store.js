import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "./reducers";

const persistConfig = {
  key: "omniview",
  storage,
  whitelist: ["Login", "Application", "Customer"],
  stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let _store = null;
if (process.env.NODE_ENV === "development") {
  _store = createStore(persistedReducer, applyMiddleware(thunk, logger));
} else {
  _store = createStore(persistedReducer, applyMiddleware(thunk));
}

const store = _store;
const persistor = persistStore(store);

export default { store, persistor };

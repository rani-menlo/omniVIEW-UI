import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "./reducers";

const persistConfig = {
  key: "omniview",
  storage,
  blacklist: ["Api", "Customer", "Application", "Submission"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let _store = null;
if (process.env.NODE_ENV === "production") {
  _store = createStore(persistedReducer, applyMiddleware(thunk));
} else {
  _store = createStore(persistedReducer, applyMiddleware(thunk, logger));
}

const store = _store;
const persistor = persistStore(store);
// persistor.purge();

export default { store, persistor };

// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import profileReducer from "./slices/profile.slice";

// Persist config for profile slice
const profilePersistConfig = {
  key: "profile",
  storage,
  // Only persist specific fields to avoid storing sensitive data unnecessarily
  whitelist: ["data", "isAuthenticated", "lastFetched"],
  // Blacklist sensitive or temporary fields
  blacklist: ["loading", "error"],
};

const persistedProfileReducer = persistReducer(
  profilePersistConfig,
  profileReducer
);

export const store = configureStore({
  reducer: {
    profile: persistedProfileReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore date serialization warnings for profile data
        ignoredActionsPaths: [
          "payload.lastLogin",
          "payload.createdAt",
          "payload.updatedAt",
        ],
        ignoredStatePaths: [
          "profile.data.lastLogin",
          "profile.data.createdAt",
          "profile.data.updatedAt",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "https://unenthralling-melaine-kitcheny.ngrok-free.dev",
    plugins: [
        expoClient({
            scheme: "attendancemobile",
            storagePrefix: "attendancemobile",
            storage: SecureStore,
        })
    ]
});
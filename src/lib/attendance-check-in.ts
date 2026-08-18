import * as Location from "expo-location";

import { api } from "./axios";

type CheckInMethod = "QR" | "MANUAL_CODE";

type CheckInPayload = {
  method: CheckInMethod;
  qrToken?: string;
  manualCode?: string;
  latitude?: number;
  longitude?: number;
};

type AttendanceQrPayload = {
  type?: string;
  sessionId?: string;
  qrToken?: string;
};

function apiErrorMessage(error: any) {
  return error?.response?.data?.message || error?.message || "Failed to check in";
}

async function postWithLocationRetry(path: string, payload: CheckInPayload) {
  try {
    return await api.post(path, payload);
  } catch (error: any) {
    const message = apiErrorMessage(error);
    const locationRequired =
      error?.response?.status === 400 &&
      message.toLowerCase().includes("location coordinates are required");

    if (!locationRequired) throw error;

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      throw new Error("Location permission is required for this attendance session.");
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return api.post(path, {
      ...payload,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  }
}

export async function checkInWithQr(scannedValue: string) {
  let payload: AttendanceQrPayload;

  try {
    payload = JSON.parse(scannedValue) as AttendanceQrPayload;
  } catch {
    throw new Error("This is not a valid attendance QR code.");
  }

  const sessionId = payload.sessionId?.trim();
  const qrToken = payload.qrToken?.trim();

  if (payload.type !== "attendance-check-in" || !sessionId || !qrToken) {
    throw new Error("This attendance QR code is incomplete or invalid.");
  }

  return postWithLocationRetry(
    `/api/sessions/${encodeURIComponent(sessionId)}/check-in`,
    { method: "QR", qrToken },
  );
}

export function checkInWithManualCode(code: string) {
  return postWithLocationRetry("/api/sessions/check-in", {
    method: "MANUAL_CODE",
    manualCode: code.trim().toUpperCase(),
  });
}

export { apiErrorMessage };

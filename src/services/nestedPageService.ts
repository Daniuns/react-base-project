import { API_URL } from "@/settings";
import noAuthApi from "./noAuthApi";

export const getTanStackData = async () => {
  console.log("API_URL", API_URL);
  const response = await noAuthApi.get("/repos/TanStack/query");
  console.log("response", response);
  return response.data;
};

export const postTanStackData = async (id: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("update id:", id);

      resolve({ success: true });
    }, 5000);
  });
};

export const deleteTanStackData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

export const putTanStackData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

export const patchTanStackData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

import axios, { AxiosInstance } from "axios";

const createAxiosInstance = (token: string): AxiosInstance => {
  return axios.create({
    baseURL: "http://localhost:8088",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const req = {
  GET: async (url: string, token: string) => {
    const response = await createAxiosInstance(token).get(url);
    return response.data;
  },
  POST: async (url: string, data: any, token: string) => {
    const response = await createAxiosInstance(token).post(url, data);
    return response.data;
  },
};

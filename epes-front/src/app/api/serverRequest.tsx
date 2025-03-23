import axios, { AxiosRequestConfig } from "axios";

export const serverRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  route: string,
  body?: any,
  params?: any
) => {
  const url = `${process.env.NEXT_PUBLIC_EPES_SERVICE}${route}`;

  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: body,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params,
    };

    const response = await axios(config);
    return response;
  } catch (error: any) {
    console.error(`Error in ${method} request to ${url}:`, error);
    throw new Error(error.response?.data?.message || "Request failed.");
  }
};

import axios, { AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

export const request = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  route: string,
  token: string,
  body?: any,
  params?: any
) => {
  if (!token) {
    throw new Error("Unauthorized: No token provided.");
  }

  const url = `${process.env.NEXT_PUBLIC_EPES_SERVICE}${route}`;

  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params,
    };

    const response = await axios(config);
    if (response.status === 401) redirect("/auth/signin");

    return response.data;
  } catch (error: any) {
    console.error(
      `Error in ${method} request to ${url}:`,
      error.response || error
    );
    throw new Error(error.response?.data?.error);
  }
};

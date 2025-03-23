import axios, { AxiosRequestConfig } from "axios";

export const formRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  route: string,
  token: string,
  body?: any
) => {
  if (!token) {
    throw new Error("Unauthorized: No token provided.");
  }

  const url = `${process.env.NEXT_PUBLIC_EPES_SERVICE}${route}`;

  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    };

    config.data = body;

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error in ${method} request to ${url}:`,
      error.response || error
    );
    throw new Error(
      error.response?.data?.message || "An error occurred during the request."
    );
  }
};

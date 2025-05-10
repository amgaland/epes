// src/app/api.ts
import axios from "axios";

interface RequestOptions {
  headers?: Record<string, string>;
}

export const req = {
  async GET(url: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`http://localhost:8088${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async POST(
    url: string,
    data: any,
    token: string,
    options: RequestOptions = {}
  ): Promise<any> {
    console.log(
      `Sending POST payload to ${url}:`,
      JSON.stringify(data, null, 2)
    );
    try {
      const response = await axios.post(`http://localhost:8088${url}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(
        `Error in POST to ${url}:`,
        error.response?.data?.error || error.message
      );
      throw new Error(error.response?.data?.error || error.message);
    }
  },
};

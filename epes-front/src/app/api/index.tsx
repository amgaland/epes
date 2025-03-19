import { request } from "./routeHandler";

const GET = async (route: string, token: string, params?: any) =>
  request("GET", route, token, undefined, params);

const POST = async (route: string, token: string, body?: any, params?: any) =>
  request("POST", route, token, body, params);

const PUT = async (route: string, token: string, body?: any, params?: any) =>
  request("PUT", route, token, body, params);

const DELETE = async (route: string, token: string, params?: any) =>
  request("DELETE", route, token, undefined, params);

export const req = { GET, POST, PUT, DELETE };

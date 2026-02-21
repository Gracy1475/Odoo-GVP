import { Role } from "./types";

const permissionMap: Record<Role, string[]> = {
  Manager: ["/dashboard", "/vehicles", "/dispatcher", "/maintenance", "/expenses", "/drivers", "/analytics"],
  Dispatcher: ["/dispatcher"],
  "Safety Officer": ["/drivers", "/maintenance"],
  "Financial Analyst": ["/expenses", "/analytics"],
};

export function getAllowedPaths(role: Role) {
  return permissionMap[role];
}

export function canAccessPath(role: Role, pathname: string) {
  if (role === "Manager") return true;
  return permissionMap[role].some((path) => pathname.startsWith(path));
}

export function getRoleHome(role: Role) {
  switch (role) {
    case "Dispatcher":
      return "/dispatcher";
    case "Safety Officer":
      return "/drivers";
    case "Financial Analyst":
      return "/analytics";
    default:
      return "/dashboard";
  }
}

export const roleOptions: Role[] = ["Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

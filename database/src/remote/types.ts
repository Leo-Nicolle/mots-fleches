import { Grid, GridStyle, SolutionStyle } from "grid";
import { Book, Font } from "../types";
import { AxiosResponse } from "axios";

export type PlanLimits = {
  grids: number;
  custom_words: number;
  word_lists: number;
  max_list_size: number;
};

export type Plan = {
  price: number;
  period: "monthly" | "yearly";
  tierId: number;
  currency: string;
  nickname: string;
  name: string;
  productId: string;
  planId: string;
  limits: PlanLimits;
};

export type PlansResponse = {
  publishableKey: string;
  plans: Plan[];
};

export type GroupMember = {
  user_id: number;
  email: string;
  role: string;
};

export type GroupSummary = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  role: string;
  members_count: number;
};

export type GroupDetail = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  members: GroupMember[];
};

export type ProfileResponse = {
  email: string;
  pseudo?: string | null;
  billing?: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    zip?: string;
  } | null;
};
// Generic type to generate API route mappings dynamically
type GenMap<T extends string, D> = {
  [K in `/${T}s` | `/${T}/:id`]: K extends `/${T}/:id` ? D : D[];
};
type GenDeleteMap<T extends string, D = string> = {
  [K in `/${T}/:id`]: K extends `/${T}/:id` ? D : never;
};
type GenPostMap<T extends string, D = string> = {
  [K in `/${T}`]: K extends `/${T}/:id` ? D : never;
};

// Helper type to normalize dynamic routes (convert "/item/123" → "/item/:id")
type NormalizeRoute<T extends string, M> = T extends `/${infer Static}`
  ? `/${Static}`
  : T extends `/${infer Static}/${string}`
  ? `/${Static}/:id` extends keyof M
    ? `/${Static}/:id`
    : never
  : T;

// Helper type to resolve the correct return type
type ResolveRoute<T extends string, M> = NormalizeRoute<
  T,
  M
> extends keyof ApiGetMap
  ? ApiGetMap[NormalizeRoute<T, M>]
  : never;
type ApiGetMap = GenMap<"grid", Grid> &
  GenMap<"book", Book> &
  GenMap<"word", string> &
  GenMap<"font", Font> &
  GenMap<"banned-word", string> &
  GenMap<"style", GridStyle | SolutionStyle> & {
    "/payments/plans": PlansResponse;
    "/me": { id: number; email: string };
    "/profile": ProfileResponse;
    "/groups": GroupSummary[];
    "/group/:id": GroupDetail;
    "/group/:id/member": GroupMember;
    "/group/:id/grids": Grid[];
    "/group/:id/books": Book[];
    "/group/:id/styles": (GridStyle | SolutionStyle)[];
  };
type ApiPostMap = {
  "/auth/login": {
    body: {
      email: string;
      password: string;
    };
    response: {
      accessToken: string;
      refreshToken: string;
    };
  };
  "/auth/register": {
    body: {
      email: string;
      password: string;
    };
    response: {
      message: string;
      userId: string;
    };
  };
  "/auth/logout": {
    body: undefined;
    response: { message: string };
  };
  "/payments/subscribe": {
    body: {
      planId: string;
    };
    response: {
      client_secret: string;
    };
  };
  "/auth/change-password": {
    body: {
      currentPassword: string;
      newPassword: string;
    };
    response: { message: string };
  };
  "/group": {
    body: { name: string; description?: string };
    response: { id: number; name: string; description: string | null };
  };
  "/group/:id/member": {
    body: { email: string; role?: string };
    response: GroupMember;
  };
  "/group/:id/grid/:gridId/share": {
    body: undefined;
    response: { success: true };
  };
  "/group/:id/book/:bookId/share": {
    body: undefined;
    response: { success: true };
  };
  "/group/:id/style/:styleId/share": {
    body: undefined;
    response: { success: true };
  };
  // "/grid": {
  //   body: GridState;
  //   response: string;
  // };
} & GenPostMap<"grid", string> &
  GenPostMap<"book", string> &
  GenPostMap<"word", string> &
  GenPostMap<"banned-word", string> &
  GenPostMap<"font", string> &
  GenPostMap<"style", string>;

type ApiDeleteMap = GenDeleteMap<"grid", string> &
  GenDeleteMap<"book", string> &
  GenDeleteMap<"word", string> &
  GenDeleteMap<"banned-word", string> &
  GenDeleteMap<"font", string> &
  GenDeleteMap<"style", string>;
export interface AxiosAPI {
  // get<T extends keyof ApiGetMap>(url: T): Promise<AxiosResponse<ApiGetMap[T]>>;
  get<T extends string>(
    url: T
  ): Promise<AxiosResponse<ResolveRoute<T, ApiGetMap>>>;

  post<T extends keyof ApiPostMap>(
    url: T,
    ...args: ApiPostMap[T] extends { body: undefined }
      ? []
      : [data: ApiPostMap[T] extends { body: infer B } ? B : never]
  ): Promise<AxiosResponse<ApiPostMap[T]["response"]>>;

  put<T extends string, D = unknown>(
    url: T,
    data?: D
  ): Promise<AxiosResponse<unknown>>;

  delete<T extends string>(
    url: T
  ): Promise<AxiosResponse<ResolveRoute<T, ApiDeleteMap>>>;
}

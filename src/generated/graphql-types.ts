import type { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  I18NLocaleCode: { input: string; output: string };
  JSON: { input: unknown; output: unknown };
}

export interface Blog {
  author: Scalars["String"]["output"];
  content: Scalars["JSON"]["output"];
  cover: UploadFile;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  locale?: Maybe<Scalars["String"]["output"]>;
  localizations: Array<Maybe<Blog>>;
  localizations_connection?: Maybe<BlogRelationResponseCollection>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  slug: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
}

export interface BloglocalizationsArgs {
  filters?: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface Bloglocalizations_connectionArgs {
  filters?: InputMaybe<BlogFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface BlogEntityResponseCollection {
  nodes: Array<Blog>;
  pageInfo: Pagination;
}

export interface BlogFiltersInput {
  and?: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  author?: InputMaybe<StringFilterInput>;
  content?: InputMaybe<JSONFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<BlogFiltersInput>;
  not?: InputMaybe<BlogFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<BlogFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
}

export interface BlogInput {
  author?: InputMaybe<Scalars["String"]["input"]>;
  content?: InputMaybe<Scalars["JSON"]["input"]>;
  cover?: InputMaybe<Scalars["ID"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
}

export interface BlogRelationResponseCollection {
  nodes: Array<Blog>;
}

export interface BooleanFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]["input"]>>>;
  contains?: InputMaybe<Scalars["Boolean"]["input"]>;
  containsi?: InputMaybe<Scalars["Boolean"]["input"]>;
  endsWith?: InputMaybe<Scalars["Boolean"]["input"]>;
  eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  eqi?: InputMaybe<Scalars["Boolean"]["input"]>;
  gt?: InputMaybe<Scalars["Boolean"]["input"]>;
  gte?: InputMaybe<Scalars["Boolean"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]["input"]>>>;
  lt?: InputMaybe<Scalars["Boolean"]["input"]>;
  lte?: InputMaybe<Scalars["Boolean"]["input"]>;
  ne?: InputMaybe<Scalars["Boolean"]["input"]>;
  nei?: InputMaybe<Scalars["Boolean"]["input"]>;
  not?: InputMaybe<BooleanFilterInput>;
  notContains?: InputMaybe<Scalars["Boolean"]["input"]>;
  notContainsi?: InputMaybe<Scalars["Boolean"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["Boolean"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["Boolean"]["input"]>;
}

export interface DateTimeFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]["input"]>>>;
  contains?: InputMaybe<Scalars["DateTime"]["input"]>;
  containsi?: InputMaybe<Scalars["DateTime"]["input"]>;
  endsWith?: InputMaybe<Scalars["DateTime"]["input"]>;
  eq?: InputMaybe<Scalars["DateTime"]["input"]>;
  eqi?: InputMaybe<Scalars["DateTime"]["input"]>;
  gt?: InputMaybe<Scalars["DateTime"]["input"]>;
  gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]["input"]>>>;
  lt?: InputMaybe<Scalars["DateTime"]["input"]>;
  lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  ne?: InputMaybe<Scalars["DateTime"]["input"]>;
  nei?: InputMaybe<Scalars["DateTime"]["input"]>;
  not?: InputMaybe<DateTimeFilterInput>;
  notContains?: InputMaybe<Scalars["DateTime"]["input"]>;
  notContainsi?: InputMaybe<Scalars["DateTime"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["DateTime"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["DateTime"]["input"]>;
}

export interface DeleteMutationResponse {
  documentId: Scalars["ID"]["output"];
}

export interface FileInfoInput {
  alternativeText?: InputMaybe<Scalars["String"]["input"]>;
  caption?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
}

export interface FloatFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["Float"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["Float"]["input"]>>>;
  contains?: InputMaybe<Scalars["Float"]["input"]>;
  containsi?: InputMaybe<Scalars["Float"]["input"]>;
  endsWith?: InputMaybe<Scalars["Float"]["input"]>;
  eq?: InputMaybe<Scalars["Float"]["input"]>;
  eqi?: InputMaybe<Scalars["Float"]["input"]>;
  gt?: InputMaybe<Scalars["Float"]["input"]>;
  gte?: InputMaybe<Scalars["Float"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["Float"]["input"]>>>;
  lt?: InputMaybe<Scalars["Float"]["input"]>;
  lte?: InputMaybe<Scalars["Float"]["input"]>;
  ne?: InputMaybe<Scalars["Float"]["input"]>;
  nei?: InputMaybe<Scalars["Float"]["input"]>;
  not?: InputMaybe<FloatFilterInput>;
  notContains?: InputMaybe<Scalars["Float"]["input"]>;
  notContainsi?: InputMaybe<Scalars["Float"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["Float"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["Float"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["Float"]["input"]>;
}

export type GenericMorph =
  | Blog
  | I18NLocale
  | Menu
  | ReviewWorkflowsWorkflow
  | ReviewWorkflowsWorkflowStage
  | UploadFile
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsUser;

export interface I18NLocale {
  code?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
}

export interface I18NLocaleEntityResponseCollection {
  nodes: Array<I18NLocale>;
  pageInfo: Pagination;
}

export interface I18NLocaleFiltersInput {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<I18NLocaleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
}

export interface IDFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  contains?: InputMaybe<Scalars["ID"]["input"]>;
  containsi?: InputMaybe<Scalars["ID"]["input"]>;
  endsWith?: InputMaybe<Scalars["ID"]["input"]>;
  eq?: InputMaybe<Scalars["ID"]["input"]>;
  eqi?: InputMaybe<Scalars["ID"]["input"]>;
  gt?: InputMaybe<Scalars["ID"]["input"]>;
  gte?: InputMaybe<Scalars["ID"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  lt?: InputMaybe<Scalars["ID"]["input"]>;
  lte?: InputMaybe<Scalars["ID"]["input"]>;
  ne?: InputMaybe<Scalars["ID"]["input"]>;
  nei?: InputMaybe<Scalars["ID"]["input"]>;
  not?: InputMaybe<IDFilterInput>;
  notContains?: InputMaybe<Scalars["ID"]["input"]>;
  notContainsi?: InputMaybe<Scalars["ID"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["ID"]["input"]>;
}

export interface IntFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  contains?: InputMaybe<Scalars["Int"]["input"]>;
  containsi?: InputMaybe<Scalars["Int"]["input"]>;
  endsWith?: InputMaybe<Scalars["Int"]["input"]>;
  eq?: InputMaybe<Scalars["Int"]["input"]>;
  eqi?: InputMaybe<Scalars["Int"]["input"]>;
  gt?: InputMaybe<Scalars["Int"]["input"]>;
  gte?: InputMaybe<Scalars["Int"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  lt?: InputMaybe<Scalars["Int"]["input"]>;
  lte?: InputMaybe<Scalars["Int"]["input"]>;
  ne?: InputMaybe<Scalars["Int"]["input"]>;
  nei?: InputMaybe<Scalars["Int"]["input"]>;
  not?: InputMaybe<IntFilterInput>;
  notContains?: InputMaybe<Scalars["Int"]["input"]>;
  notContainsi?: InputMaybe<Scalars["Int"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["Int"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["Int"]["input"]>;
}

export interface JSONFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["JSON"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["JSON"]["input"]>>>;
  contains?: InputMaybe<Scalars["JSON"]["input"]>;
  containsi?: InputMaybe<Scalars["JSON"]["input"]>;
  endsWith?: InputMaybe<Scalars["JSON"]["input"]>;
  eq?: InputMaybe<Scalars["JSON"]["input"]>;
  eqi?: InputMaybe<Scalars["JSON"]["input"]>;
  gt?: InputMaybe<Scalars["JSON"]["input"]>;
  gte?: InputMaybe<Scalars["JSON"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["JSON"]["input"]>>>;
  lt?: InputMaybe<Scalars["JSON"]["input"]>;
  lte?: InputMaybe<Scalars["JSON"]["input"]>;
  ne?: InputMaybe<Scalars["JSON"]["input"]>;
  nei?: InputMaybe<Scalars["JSON"]["input"]>;
  not?: InputMaybe<JSONFilterInput>;
  notContains?: InputMaybe<Scalars["JSON"]["input"]>;
  notContainsi?: InputMaybe<Scalars["JSON"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["JSON"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["JSON"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["JSON"]["input"]>;
}

export interface Menu {
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  isButton: Scalars["Boolean"]["output"];
  locale?: Maybe<Scalars["String"]["output"]>;
  localizations: Array<Maybe<Menu>>;
  localizations_connection?: Maybe<MenuRelationResponseCollection>;
  menu?: Maybe<Menu>;
  menus: Array<Maybe<Menu>>;
  menus_connection?: Maybe<MenuRelationResponseCollection>;
  order: Scalars["Int"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  targetBlank: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
}

export interface MenulocalizationsArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface Menulocalizations_connectionArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface MenumenusArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface Menumenus_connectionArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface MenuEntityResponseCollection {
  nodes: Array<Menu>;
  pageInfo: Pagination;
}

export interface MenuFiltersInput {
  and?: InputMaybe<Array<InputMaybe<MenuFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  isButton?: InputMaybe<BooleanFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<MenuFiltersInput>;
  menu?: InputMaybe<MenuFiltersInput>;
  menus?: InputMaybe<MenuFiltersInput>;
  not?: InputMaybe<MenuFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<MenuFiltersInput>>>;
  order?: InputMaybe<IntFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  targetBlank?: InputMaybe<BooleanFilterInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  url?: InputMaybe<StringFilterInput>;
}

export interface MenuInput {
  isButton?: InputMaybe<Scalars["Boolean"]["input"]>;
  menu?: InputMaybe<Scalars["ID"]["input"]>;
  menus?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  targetBlank?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
}

export interface MenuRelationResponseCollection {
  nodes: Array<Menu>;
}

export interface Mutation {
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>;
  createBlog?: Maybe<Blog>;
  createMenu?: Maybe<Menu>;
  createReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  createReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteBlog?: Maybe<DeleteMutationResponse>;
  deleteMenu?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflow?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflowStage?: Maybe<DeleteMutationResponse>;
  deleteUploadFile?: Maybe<UploadFile>;
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>;
  updateBlog?: Maybe<Blog>;
  updateMenu?: Maybe<Menu>;
  updateReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  updateReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  updateUploadFile: UploadFile;
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
}

export interface MutationchangePasswordArgs {
  currentPassword: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  passwordConfirmation: Scalars["String"]["input"];
}

export interface MutationcreateBlogArgs {
  data: BlogInput;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationcreateMenuArgs {
  data: MenuInput;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationcreateReviewWorkflowsWorkflowArgs {
  data: ReviewWorkflowsWorkflowInput;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationcreateReviewWorkflowsWorkflowStageArgs {
  data: ReviewWorkflowsWorkflowStageInput;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationcreateUsersPermissionsRoleArgs {
  data: UsersPermissionsRoleInput;
}

export interface MutationcreateUsersPermissionsUserArgs {
  data: UsersPermissionsUserInput;
}

export interface MutationdeleteBlogArgs {
  documentId: Scalars["ID"]["input"];
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
}

export interface MutationdeleteMenuArgs {
  documentId: Scalars["ID"]["input"];
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
}

export interface MutationdeleteReviewWorkflowsWorkflowArgs {
  documentId: Scalars["ID"]["input"];
}

export interface MutationdeleteReviewWorkflowsWorkflowStageArgs {
  documentId: Scalars["ID"]["input"];
}

export interface MutationdeleteUploadFileArgs {
  id: Scalars["ID"]["input"];
}

export interface MutationdeleteUsersPermissionsRoleArgs {
  id: Scalars["ID"]["input"];
}

export interface MutationdeleteUsersPermissionsUserArgs {
  id: Scalars["ID"]["input"];
}

export interface MutationemailConfirmationArgs {
  confirmation: Scalars["String"]["input"];
}

export interface MutationforgotPasswordArgs {
  email: Scalars["String"]["input"];
}

export interface MutationloginArgs {
  input: UsersPermissionsLoginInput;
}

export interface MutationregisterArgs {
  input: UsersPermissionsRegisterInput;
}

export interface MutationresetPasswordArgs {
  code: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  passwordConfirmation: Scalars["String"]["input"];
}

export interface MutationupdateBlogArgs {
  data: BlogInput;
  documentId: Scalars["ID"]["input"];
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationupdateMenuArgs {
  data: MenuInput;
  documentId: Scalars["ID"]["input"];
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationupdateReviewWorkflowsWorkflowArgs {
  data: ReviewWorkflowsWorkflowInput;
  documentId: Scalars["ID"]["input"];
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationupdateReviewWorkflowsWorkflowStageArgs {
  data: ReviewWorkflowsWorkflowStageInput;
  documentId: Scalars["ID"]["input"];
  status?: InputMaybe<PublicationStatus>;
}

export interface MutationupdateUploadFileArgs {
  id: Scalars["ID"]["input"];
  info?: InputMaybe<FileInfoInput>;
}

export interface MutationupdateUsersPermissionsRoleArgs {
  data: UsersPermissionsRoleInput;
  id: Scalars["ID"]["input"];
}

export interface MutationupdateUsersPermissionsUserArgs {
  data: UsersPermissionsUserInput;
  id: Scalars["ID"]["input"];
}

export interface Pagination {
  page: Scalars["Int"]["output"];
  pageCount: Scalars["Int"]["output"];
  pageSize: Scalars["Int"]["output"];
  total: Scalars["Int"]["output"];
}

export interface PaginationArg {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  start?: InputMaybe<Scalars["Int"]["input"]>;
}

export enum PublicationStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export interface Query {
  blog?: Maybe<Blog>;
  blogs: Array<Maybe<Blog>>;
  blogs_connection?: Maybe<BlogEntityResponseCollection>;
  i18NLocale?: Maybe<I18NLocale>;
  i18NLocales: Array<Maybe<I18NLocale>>;
  i18NLocales_connection?: Maybe<I18NLocaleEntityResponseCollection>;
  me?: Maybe<UsersPermissionsMe>;
  menu?: Maybe<Menu>;
  menus: Array<Maybe<Menu>>;
  menus_connection?: Maybe<MenuEntityResponseCollection>;
  reviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  reviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  reviewWorkflowsWorkflowStages_connection?: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>;
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>;
  reviewWorkflowsWorkflows_connection?: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>;
  uploadFile?: Maybe<UploadFile>;
  uploadFiles: Array<Maybe<UploadFile>>;
  uploadFiles_connection?: Maybe<UploadFileEntityResponseCollection>;
  usersPermissionsRole?: Maybe<UsersPermissionsRole>;
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>;
  usersPermissionsRoles_connection?: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser?: Maybe<UsersPermissionsUser>;
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>;
  usersPermissionsUsers_connection?: Maybe<UsersPermissionsUserEntityResponseCollection>;
}

export interface QueryblogArgs {
  documentId: Scalars["ID"]["input"];
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface QueryblogsArgs {
  filters?: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<PublicationStatus>;
}

export interface Queryblogs_connectionArgs {
  filters?: InputMaybe<BlogFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<PublicationStatus>;
}

export interface Queryi18NLocaleArgs {
  documentId: Scalars["ID"]["input"];
}

export interface Queryi18NLocalesArgs {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface Queryi18NLocales_connectionArgs {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QuerymenuArgs {
  documentId: Scalars["ID"]["input"];
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  status?: InputMaybe<PublicationStatus>;
}

export interface QuerymenusArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<PublicationStatus>;
}

export interface Querymenus_connectionArgs {
  filters?: InputMaybe<MenuFiltersInput>;
  hasPublishedVersion?: InputMaybe<Scalars["Boolean"]["input"]>;
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  status?: InputMaybe<PublicationStatus>;
}

export interface QueryreviewWorkflowsWorkflowArgs {
  documentId: Scalars["ID"]["input"];
}

export interface QueryreviewWorkflowsWorkflowStageArgs {
  documentId: Scalars["ID"]["input"];
}

export interface QueryreviewWorkflowsWorkflowStagesArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryreviewWorkflowsWorkflowStages_connectionArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryreviewWorkflowsWorkflowsArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryreviewWorkflowsWorkflows_connectionArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryuploadFileArgs {
  documentId: Scalars["ID"]["input"];
}

export interface QueryuploadFilesArgs {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryuploadFiles_connectionArgs {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryusersPermissionsRoleArgs {
  documentId: Scalars["ID"]["input"];
}

export interface QueryusersPermissionsRolesArgs {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryusersPermissionsRoles_connectionArgs {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryusersPermissionsUserArgs {
  documentId: Scalars["ID"]["input"];
}

export interface QueryusersPermissionsUsersArgs {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface QueryusersPermissionsUsers_connectionArgs {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface ReviewWorkflowsWorkflow {
  contentTypes: Scalars["JSON"]["output"];
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  stageRequiredToPublish?: Maybe<ReviewWorkflowsWorkflowStage>;
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  stages_connection?: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
}

export interface ReviewWorkflowsWorkflowstagesArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface ReviewWorkflowsWorkflowstages_connectionArgs {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface ReviewWorkflowsWorkflowEntityResponseCollection {
  nodes: Array<ReviewWorkflowsWorkflow>;
  pageInfo: Pagination;
}

export interface ReviewWorkflowsWorkflowFiltersInput {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  contentTypes?: InputMaybe<JSONFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  stageRequiredToPublish?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  stages?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
}

export interface ReviewWorkflowsWorkflowInput {
  contentTypes?: InputMaybe<Scalars["JSON"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  stageRequiredToPublish?: InputMaybe<Scalars["ID"]["input"]>;
  stages?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
}

export interface ReviewWorkflowsWorkflowStage {
  color?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  workflow?: Maybe<ReviewWorkflowsWorkflow>;
}

export interface ReviewWorkflowsWorkflowStageEntityResponseCollection {
  nodes: Array<ReviewWorkflowsWorkflowStage>;
  pageInfo: Pagination;
}

export interface ReviewWorkflowsWorkflowStageFiltersInput {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  color?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  workflow?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
}

export interface ReviewWorkflowsWorkflowStageInput {
  color?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  workflow?: InputMaybe<Scalars["ID"]["input"]>;
}

export interface ReviewWorkflowsWorkflowStageRelationResponseCollection {
  nodes: Array<ReviewWorkflowsWorkflowStage>;
}

export interface StringFilterInput {
  and?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  contains?: InputMaybe<Scalars["String"]["input"]>;
  containsi?: InputMaybe<Scalars["String"]["input"]>;
  endsWith?: InputMaybe<Scalars["String"]["input"]>;
  eq?: InputMaybe<Scalars["String"]["input"]>;
  eqi?: InputMaybe<Scalars["String"]["input"]>;
  gt?: InputMaybe<Scalars["String"]["input"]>;
  gte?: InputMaybe<Scalars["String"]["input"]>;
  in?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  lt?: InputMaybe<Scalars["String"]["input"]>;
  lte?: InputMaybe<Scalars["String"]["input"]>;
  ne?: InputMaybe<Scalars["String"]["input"]>;
  nei?: InputMaybe<Scalars["String"]["input"]>;
  not?: InputMaybe<StringFilterInput>;
  notContains?: InputMaybe<Scalars["String"]["input"]>;
  notContainsi?: InputMaybe<Scalars["String"]["input"]>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  notNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  null?: InputMaybe<Scalars["Boolean"]["input"]>;
  or?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  startsWith?: InputMaybe<Scalars["String"]["input"]>;
}

export interface UploadFile {
  alternativeText?: Maybe<Scalars["String"]["output"]>;
  caption?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  ext?: Maybe<Scalars["String"]["output"]>;
  focalPoint?: Maybe<Scalars["JSON"]["output"]>;
  formats?: Maybe<Scalars["JSON"]["output"]>;
  hash: Scalars["String"]["output"];
  height?: Maybe<Scalars["Int"]["output"]>;
  mime: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  previewUrl?: Maybe<Scalars["String"]["output"]>;
  provider: Scalars["String"]["output"];
  provider_metadata?: Maybe<Scalars["JSON"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  related?: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars["Float"]["output"];
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  url: Scalars["String"]["output"];
  width?: Maybe<Scalars["Int"]["output"]>;
}

export interface UploadFileEntityResponseCollection {
  nodes: Array<UploadFile>;
  pageInfo: Pagination;
}

export interface UploadFileFiltersInput {
  alternativeText?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  ext?: InputMaybe<StringFilterInput>;
  focalPoint?: InputMaybe<JSONFilterInput>;
  formats?: InputMaybe<JSONFilterInput>;
  hash?: InputMaybe<StringFilterInput>;
  height?: InputMaybe<IntFilterInput>;
  mime?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UploadFileFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl?: InputMaybe<StringFilterInput>;
  provider?: InputMaybe<StringFilterInput>;
  provider_metadata?: InputMaybe<JSONFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  size?: InputMaybe<FloatFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  url?: InputMaybe<StringFilterInput>;
  width?: InputMaybe<IntFilterInput>;
}

export interface UsersPermissionsCreateRolePayload {
  ok: Scalars["Boolean"]["output"];
}

export interface UsersPermissionsDeleteRolePayload {
  ok: Scalars["Boolean"]["output"];
}

export interface UsersPermissionsLoginInput {
  identifier: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  provider?: Scalars["String"]["input"];
}

export interface UsersPermissionsLoginPayload {
  jwt?: Maybe<Scalars["String"]["output"]>;
  user: UsersPermissionsMe;
}

export interface UsersPermissionsMe {
  blocked?: Maybe<Scalars["Boolean"]["output"]>;
  confirmed?: Maybe<Scalars["Boolean"]["output"]>;
  documentId: Scalars["ID"]["output"];
  email?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  role?: Maybe<UsersPermissionsMeRole>;
  username: Scalars["String"]["output"];
}

export interface UsersPermissionsMeRole {
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  type?: Maybe<Scalars["String"]["output"]>;
}

export interface UsersPermissionsPasswordPayload {
  ok: Scalars["Boolean"]["output"];
}

export interface UsersPermissionsPermission {
  action: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  role?: Maybe<UsersPermissionsRole>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
}

export interface UsersPermissionsPermissionFiltersInput {
  action?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
}

export interface UsersPermissionsPermissionRelationResponseCollection {
  nodes: Array<UsersPermissionsPermission>;
}

export interface UsersPermissionsRegisterInput {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
}

export interface UsersPermissionsRole {
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  documentId: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  permissions: Array<Maybe<UsersPermissionsPermission>>;
  permissions_connection?: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  users: Array<Maybe<UsersPermissionsUser>>;
  users_connection?: Maybe<UsersPermissionsUserRelationResponseCollection>;
}

export interface UsersPermissionsRolepermissionsArgs {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface UsersPermissionsRolepermissions_connectionArgs {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface UsersPermissionsRoleusersArgs {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface UsersPermissionsRoleusers_connectionArgs {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
}

export interface UsersPermissionsRoleEntityResponseCollection {
  nodes: Array<UsersPermissionsRole>;
  pageInfo: Pagination;
}

export interface UsersPermissionsRoleFiltersInput {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  users?: InputMaybe<UsersPermissionsUserFiltersInput>;
}

export interface UsersPermissionsRoleInput {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  permissions?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  users?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
}

export interface UsersPermissionsUpdateRolePayload {
  ok: Scalars["Boolean"]["output"];
}

export interface UsersPermissionsUser {
  blocked?: Maybe<Scalars["Boolean"]["output"]>;
  confirmed?: Maybe<Scalars["Boolean"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  documentId: Scalars["ID"]["output"];
  email: Scalars["String"]["output"];
  provider?: Maybe<Scalars["String"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  role?: Maybe<UsersPermissionsRole>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  username: Scalars["String"]["output"];
}

export interface UsersPermissionsUserEntityResponse {
  data?: Maybe<UsersPermissionsUser>;
}

export interface UsersPermissionsUserEntityResponseCollection {
  nodes: Array<UsersPermissionsUser>;
  pageInfo: Pagination;
}

export interface UsersPermissionsUserFiltersInput {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked?: InputMaybe<BooleanFilterInput>;
  confirmed?: InputMaybe<BooleanFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IDFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsUserFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  provider?: InputMaybe<StringFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  username?: InputMaybe<StringFilterInput>;
}

export interface UsersPermissionsUserInput {
  blocked?: InputMaybe<Scalars["Boolean"]["input"]>;
  confirmed?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  password?: InputMaybe<Scalars["String"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  role?: InputMaybe<Scalars["ID"]["input"]>;
  username?: InputMaybe<Scalars["String"]["input"]>;
}

export interface UsersPermissionsUserRelationResponseCollection {
  nodes: Array<UsersPermissionsUser>;
}

export type GetBlogListQueryVariables = Exact<{
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetBlogListQuery = {
  blogs: Array<
    | {
        documentId: string;
        title: string;
        content: unknown;
        author: string;
        slug: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        locale?: string | undefined;
        cover: {
          documentId: string;
          name: string;
          alternativeText?: string | undefined;
          caption?: string | undefined;
          focalPoint?: unknown | undefined;
          width?: number | undefined;
          height?: number | undefined;
          formats?: unknown | undefined;
          hash: string;
          ext?: string | undefined;
          mime: string;
          size: number;
          url: string;
          previewUrl?: string | undefined;
          provider: string;
          provider_metadata?: unknown | undefined;
          createdAt?: string | undefined;
          updatedAt?: string | undefined;
          publishedAt?: string | undefined;
        };
        localizations: Array<
          | {
              documentId: string;
              locale?: string | undefined;
              slug: string;
              title: string;
            }
          | undefined
        >;
      }
    | undefined
  >;
};

export type GetMenuListQueryVariables = Exact<{
  locale?: InputMaybe<Scalars["I18NLocaleCode"]["input"]>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetMenuListQuery = {
  menus: Array<
    | {
        documentId: string;
        title: string;
        url?: string | undefined;
        order: number;
        isButton: boolean;
        targetBlank: boolean;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        locale?: string | undefined;
        menu?:
          | {
              documentId: string;
              title: string;
              url?: string | undefined;
              order: number;
              isButton: boolean;
              targetBlank: boolean;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
              locale?: string | undefined;
              menu?:
                | {
                    documentId: string;
                    title: string;
                    url?: string | undefined;
                    order: number;
                    isButton: boolean;
                    targetBlank: boolean;
                    createdAt?: string | undefined;
                    updatedAt?: string | undefined;
                    publishedAt?: string | undefined;
                    locale?: string | undefined;
                    menu?:
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined;
                    menus: Array<
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined
                    >;
                    localizations: Array<
                      | {
                          documentId: string;
                          locale?: string | undefined;
                          title: string;
                        }
                      | undefined
                    >;
                  }
                | undefined;
              menus: Array<
                | {
                    documentId: string;
                    title: string;
                    url?: string | undefined;
                    order: number;
                    isButton: boolean;
                    targetBlank: boolean;
                    createdAt?: string | undefined;
                    updatedAt?: string | undefined;
                    publishedAt?: string | undefined;
                    locale?: string | undefined;
                    menu?:
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined;
                    menus: Array<
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined
                    >;
                    localizations: Array<
                      | {
                          documentId: string;
                          locale?: string | undefined;
                          title: string;
                        }
                      | undefined
                    >;
                  }
                | undefined
              >;
              localizations: Array<
                | {
                    documentId: string;
                    locale?: string | undefined;
                    title: string;
                  }
                | undefined
              >;
            }
          | undefined;
        menus: Array<
          | {
              documentId: string;
              title: string;
              url?: string | undefined;
              order: number;
              isButton: boolean;
              targetBlank: boolean;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
              locale?: string | undefined;
              menu?:
                | {
                    documentId: string;
                    title: string;
                    url?: string | undefined;
                    order: number;
                    isButton: boolean;
                    targetBlank: boolean;
                    createdAt?: string | undefined;
                    updatedAt?: string | undefined;
                    publishedAt?: string | undefined;
                    locale?: string | undefined;
                    menu?:
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined;
                    menus: Array<
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined
                    >;
                    localizations: Array<
                      | {
                          documentId: string;
                          locale?: string | undefined;
                          title: string;
                        }
                      | undefined
                    >;
                  }
                | undefined;
              menus: Array<
                | {
                    documentId: string;
                    title: string;
                    url?: string | undefined;
                    order: number;
                    isButton: boolean;
                    targetBlank: boolean;
                    createdAt?: string | undefined;
                    updatedAt?: string | undefined;
                    publishedAt?: string | undefined;
                    locale?: string | undefined;
                    menu?:
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined;
                    menus: Array<
                      | {
                          documentId: string;
                          title: string;
                          url?: string | undefined;
                          order: number;
                          isButton: boolean;
                          targetBlank: boolean;
                          createdAt?: string | undefined;
                          updatedAt?: string | undefined;
                          publishedAt?: string | undefined;
                          locale?: string | undefined;
                          localizations: Array<
                            | {
                                documentId: string;
                                locale?: string | undefined;
                                title: string;
                              }
                            | undefined
                          >;
                        }
                      | undefined
                    >;
                    localizations: Array<
                      | {
                          documentId: string;
                          locale?: string | undefined;
                          title: string;
                        }
                      | undefined
                    >;
                  }
                | undefined
              >;
              localizations: Array<
                | {
                    documentId: string;
                    locale?: string | undefined;
                    title: string;
                  }
                | undefined
              >;
            }
          | undefined
        >;
        localizations: Array<
          | { documentId: string; locale?: string | undefined; title: string }
          | undefined
        >;
      }
    | undefined
  >;
};

export type GetUploadFileListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetUploadFileListQuery = {
  uploadFiles: Array<
    | {
        documentId: string;
        name: string;
        alternativeText?: string | undefined;
        caption?: string | undefined;
        focalPoint?: unknown | undefined;
        width?: number | undefined;
        height?: number | undefined;
        formats?: unknown | undefined;
        hash: string;
        ext?: string | undefined;
        mime: string;
        size: number;
        url: string;
        previewUrl?: string | undefined;
        provider: string;
        provider_metadata?: unknown | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
      }
    | undefined
  >;
};

export type GetI18NLocaleListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetI18NLocaleListQuery = {
  i18NLocales: Array<
    | {
        documentId: string;
        name?: string | undefined;
        code?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
      }
    | undefined
  >;
};

export type GetReviewWorkflowsWorkflowListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetReviewWorkflowsWorkflowListQuery = {
  reviewWorkflowsWorkflows: Array<
    | {
        documentId: string;
        name: string;
        contentTypes: unknown;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        stages: Array<
          | {
              documentId: string;
              name?: string | undefined;
              color?: string | undefined;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
            }
          | undefined
        >;
        stageRequiredToPublish?:
          | {
              documentId: string;
              name?: string | undefined;
              color?: string | undefined;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
            }
          | undefined;
      }
    | undefined
  >;
};

export type GetReviewWorkflowsWorkflowStageListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetReviewWorkflowsWorkflowStageListQuery = {
  reviewWorkflowsWorkflowStages: Array<
    | {
        documentId: string;
        name?: string | undefined;
        color?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        workflow?:
          | {
              documentId: string;
              name: string;
              contentTypes: unknown;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
            }
          | undefined;
      }
    | undefined
  >;
};

export type GetUsersPermissionsRoleListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetUsersPermissionsRoleListQuery = {
  usersPermissionsRoles: Array<
    | {
        documentId: string;
        name: string;
        description?: string | undefined;
        type?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        users: Array<
          | {
              documentId: string;
              username: string;
              email: string;
              provider?: string | undefined;
              confirmed?: boolean | undefined;
              blocked?: boolean | undefined;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
            }
          | undefined
        >;
      }
    | undefined
  >;
};

export type GetUsersPermissionsUserListQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<
    | Array<InputMaybe<Scalars["String"]["input"]>>
    | InputMaybe<Scalars["String"]["input"]>
  >;
}>;

export type GetUsersPermissionsUserListQuery = {
  usersPermissionsUsers: Array<
    | {
        documentId: string;
        username: string;
        email: string;
        provider?: string | undefined;
        confirmed?: boolean | undefined;
        blocked?: boolean | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        publishedAt?: string | undefined;
        role?:
          | {
              documentId: string;
              name: string;
              description?: string | undefined;
              type?: string | undefined;
              createdAt?: string | undefined;
              updatedAt?: string | undefined;
              publishedAt?: string | undefined;
            }
          | undefined;
      }
    | undefined
  >;
};

export const GetBlogListDocument = gql`
  query GetBlogList(
    $locale: I18NLocaleCode
    $pagination: PaginationArg
    $sort: [String]
  ) {
    blogs(locale: $locale, pagination: $pagination, sort: $sort) {
      documentId
      title
      content
      author
      slug
      createdAt
      updatedAt
      publishedAt
      locale
      cover {
        documentId
        name
        alternativeText
        caption
        focalPoint
        width
        height
        formats
        hash
        ext
        mime
        size
        url
        previewUrl
        provider
        provider_metadata
        createdAt
        updatedAt
        publishedAt
      }
      localizations {
        documentId
        locale
        slug
        title
      }
    }
  }
`;
export const GetMenuListDocument = gql`
  query GetMenuList(
    $locale: I18NLocaleCode
    $pagination: PaginationArg
    $sort: [String]
  ) {
    menus(locale: $locale, pagination: $pagination, sort: $sort) {
      documentId
      title
      url
      order
      isButton
      targetBlank
      createdAt
      updatedAt
      publishedAt
      locale
      menu {
        documentId
        title
        url
        order
        isButton
        targetBlank
        createdAt
        updatedAt
        publishedAt
        locale
        menu {
          documentId
          title
          url
          order
          isButton
          targetBlank
          createdAt
          updatedAt
          publishedAt
          locale
          menu {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          menus {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          localizations {
            documentId
            locale
            title
          }
        }
        menus {
          documentId
          title
          url
          order
          isButton
          targetBlank
          createdAt
          updatedAt
          publishedAt
          locale
          menu {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          menus {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          localizations {
            documentId
            locale
            title
          }
        }
        localizations {
          documentId
          locale
          title
        }
      }
      menus {
        documentId
        title
        url
        order
        isButton
        targetBlank
        createdAt
        updatedAt
        publishedAt
        locale
        menu {
          documentId
          title
          url
          order
          isButton
          targetBlank
          createdAt
          updatedAt
          publishedAt
          locale
          menu {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          menus {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          localizations {
            documentId
            locale
            title
          }
        }
        menus {
          documentId
          title
          url
          order
          isButton
          targetBlank
          createdAt
          updatedAt
          publishedAt
          locale
          menu {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          menus {
            documentId
            title
            url
            order
            isButton
            targetBlank
            createdAt
            updatedAt
            publishedAt
            locale
            localizations {
              documentId
              locale
              title
            }
          }
          localizations {
            documentId
            locale
            title
          }
        }
        localizations {
          documentId
          locale
          title
        }
      }
      localizations {
        documentId
        locale
        title
      }
    }
  }
`;
export const GetUploadFileListDocument = gql`
  query GetUploadFileList($pagination: PaginationArg, $sort: [String]) {
    uploadFiles(pagination: $pagination, sort: $sort) {
      documentId
      name
      alternativeText
      caption
      focalPoint
      width
      height
      formats
      hash
      ext
      mime
      size
      url
      previewUrl
      provider
      provider_metadata
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
export const GetI18NLocaleListDocument = gql`
  query GetI18NLocaleList($pagination: PaginationArg, $sort: [String]) {
    i18NLocales(pagination: $pagination, sort: $sort) {
      documentId
      name
      code
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
export const GetReviewWorkflowsWorkflowListDocument = gql`
  query GetReviewWorkflowsWorkflowList(
    $pagination: PaginationArg
    $sort: [String]
  ) {
    reviewWorkflowsWorkflows(pagination: $pagination, sort: $sort) {
      documentId
      name
      contentTypes
      createdAt
      updatedAt
      publishedAt
      stages {
        documentId
        name
        color
        createdAt
        updatedAt
        publishedAt
      }
      stageRequiredToPublish {
        documentId
        name
        color
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;
export const GetReviewWorkflowsWorkflowStageListDocument = gql`
  query GetReviewWorkflowsWorkflowStageList(
    $pagination: PaginationArg
    $sort: [String]
  ) {
    reviewWorkflowsWorkflowStages(pagination: $pagination, sort: $sort) {
      documentId
      name
      color
      createdAt
      updatedAt
      publishedAt
      workflow {
        documentId
        name
        contentTypes
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;
export const GetUsersPermissionsRoleListDocument = gql`
  query GetUsersPermissionsRoleList(
    $pagination: PaginationArg
    $sort: [String]
  ) {
    usersPermissionsRoles(pagination: $pagination, sort: $sort) {
      documentId
      name
      description
      type
      createdAt
      updatedAt
      publishedAt
      users {
        documentId
        username
        email
        provider
        confirmed
        blocked
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;
export const GetUsersPermissionsUserListDocument = gql`
  query GetUsersPermissionsUserList(
    $pagination: PaginationArg
    $sort: [String]
  ) {
    usersPermissionsUsers(pagination: $pagination, sort: $sort) {
      documentId
      username
      email
      provider
      confirmed
      blocked
      createdAt
      updatedAt
      publishedAt
      role {
        documentId
        name
        description
        type
        createdAt
        updatedAt
        publishedAt
      }
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    GetBlogList(
      variables?: GetBlogListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetBlogListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetBlogListQuery>({
            document: GetBlogListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetBlogList",
        "query",
        variables,
      );
    },
    GetMenuList(
      variables?: GetMenuListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetMenuListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetMenuListQuery>({
            document: GetMenuListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetMenuList",
        "query",
        variables,
      );
    },
    GetUploadFileList(
      variables?: GetUploadFileListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetUploadFileListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetUploadFileListQuery>({
            document: GetUploadFileListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetUploadFileList",
        "query",
        variables,
      );
    },
    GetI18NLocaleList(
      variables?: GetI18NLocaleListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetI18NLocaleListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetI18NLocaleListQuery>({
            document: GetI18NLocaleListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetI18NLocaleList",
        "query",
        variables,
      );
    },
    GetReviewWorkflowsWorkflowList(
      variables?: GetReviewWorkflowsWorkflowListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetReviewWorkflowsWorkflowListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetReviewWorkflowsWorkflowListQuery>({
            document: GetReviewWorkflowsWorkflowListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetReviewWorkflowsWorkflowList",
        "query",
        variables,
      );
    },
    GetReviewWorkflowsWorkflowStageList(
      variables?: GetReviewWorkflowsWorkflowStageListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetReviewWorkflowsWorkflowStageListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetReviewWorkflowsWorkflowStageListQuery>({
            document: GetReviewWorkflowsWorkflowStageListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetReviewWorkflowsWorkflowStageList",
        "query",
        variables,
      );
    },
    GetUsersPermissionsRoleList(
      variables?: GetUsersPermissionsRoleListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetUsersPermissionsRoleListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetUsersPermissionsRoleListQuery>({
            document: GetUsersPermissionsRoleListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetUsersPermissionsRoleList",
        "query",
        variables,
      );
    },
    GetUsersPermissionsUserList(
      variables?: GetUsersPermissionsUserListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GetUsersPermissionsUserListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetUsersPermissionsUserListQuery>({
            document: GetUsersPermissionsUserListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetUsersPermissionsUserList",
        "query",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;

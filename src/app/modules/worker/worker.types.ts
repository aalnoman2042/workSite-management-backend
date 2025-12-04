type IGetAllWorkersOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  [key: string]: any;
};
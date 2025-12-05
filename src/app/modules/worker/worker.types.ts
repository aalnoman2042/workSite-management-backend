type IGetAllWorkersOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  [key: string]: any;
};


interface UpdateWorkerProfileInput {
  name?: string;
  profilePhoto?: string
  // dailyRate?: number;
  // optional if you want to allow email change
  // add more fields as needed
  contactNumber?: string
}
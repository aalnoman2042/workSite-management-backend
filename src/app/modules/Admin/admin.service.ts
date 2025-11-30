import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
// import ApiError from "../../shared/ApiError";

const approveUser = async (userId: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Already approved?
  if (user.approved) {
    return { success: false, message: "User already approved" };
  }

  // Approve user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { approved: true },
  });

  return { success: true, message: "User approved successfully", user: updatedUser };
};

export const AdminService = {
  approveUser,
};

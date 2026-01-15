import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import ApiError from "../../Error/apiError";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../../config";
import httpStatus from "http-status";
import { WorkerPosition } from "@prisma/client";

 const  login=  async ({ email, password }: { email: string; password: string }) => {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        worker: true,
        engineer: true,
        chiefEngineer: true,
        admin: true,
      },
    });

    if (!user) throw new ApiError(404,"User not found");

    // Check if user is banned
    if (user.isBanned) throw new ApiError(403,"User is banned");

    // Check if approved
    // if (!user.approved) {throw new ApiError(403,"User not approved yet");}

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401,"Invalid password");
    // Generate JWT token
  


    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.jwt_secret as Secret, "1h");

    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.refresh_token_secret as Secret, "90d");


    // Return user profile based on role
    let profile = null;
    switch (user.role) {
      case "WORKER":
        profile = user.worker;
        break;
      case "SITE_ENGINEER":
        profile = user.engineer;
        break;
      case "CHIEF_ENGINEER":
        profile = user.chiefEngineer;
        break;
      case "ADMIN":
        profile = user.admin;
        break;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
      accessToken,
      refreshToken,
    };
  }
const getMe = async (session: any) => {
  if (!session?.accessToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access token missing");
  }

  const accessToken = session.accessToken;

  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt_secret as Secret
  );

  const { email, role } = decodedData;

  let profileData: any = null;

  switch (role) {
    case "ADMIN":
      profileData = await prisma.admin.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,

          // role: true,
          profilePhoto: true,
          createdAt: true,
        },
      });
      break;

    case "CHIEF_ENGINEER":
      profileData = await prisma.cHIEF_ENGINEER.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,  
          companyName: true,

          // role: true,
          // phone: true,
          profilePhoto: true,
          createdAt: true,
        },
      });
      break;

    case "SITE_ENGINEER":
      profileData = await prisma.sITE_Engineer.findUnique({
        where: { email },
        select: {
          
          id: true,
          name: true,
          email: true,
          companyName: true, 
          contactNumber: true,
          // aapproved: true,
          // role: true,
          // phone: true,
          profilePhoto: true,
          createdAt: true,
        },
      });
      break;

    case "WORKER":
      profileData = await prisma.worker.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          approved: true, 
          nidNumber: true,
          contactNumber: true,
          banned: true,
          dailyRate : true,
          position : true,
          // role: true,
          // phone: true,
          // siteId: true,
          profilePhoto: true,
          createdAt: true,
        },
      });
      break;

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role");
  }

  if (!profileData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return profileData;
};


interface UpdatePayload {
    name?: string;
    contactNumber?: string ;
    profilePhoto?: string | null;
    companyName?: string | null;
    nidNumber?: string 
    dailyRate?: number | null;
    position?: WorkerPosition
    // Add other updateable fields here
}
const updateProfile = async (id: string, updateData: UpdatePayload) => {
    // 1. Find the user's role by checking existence in different profile tables
    //    We check the profile tables directly, which is more robust than relying on JWT role 
    //    if the user is updating another profile (though here we assume the user is updating their own profile).

    let updatedData: any = null;

    // Check Worker
    const workerProfile = await prisma.worker.findUnique({ where: { id } });
    if (workerProfile) {
        updatedData = await prisma.worker.update({
            where: { id },
            data: updateData,
        });
        return { ...updatedData, role: 'WORKER' };
    }

    // Check Chief Engineer
    const chiefEngineerProfile = await prisma.cHIEF_ENGINEER.findUnique({ where: { id } });
    if (chiefEngineerProfile) {
        // Filter out worker-specific fields if they exist in updateData
        const { dailyRate,  ...engineerUpdateData } = updateData;
        updatedData = await prisma.cHIEF_ENGINEER.update({
            where: { id },
            data: engineerUpdateData,
        });
        return { ...updatedData, role: 'CHIEF_ENGINEER' };
    }

    // Check Site Engineer
    const siteEngineerProfile = await prisma.sITE_Engineer.findUnique({ where: { id } });
    if (siteEngineerProfile) {
        const { dailyRate,  ...engineerUpdateData } = updateData;
        updatedData = await prisma.sITE_Engineer.update({
            where: { id },
            data: engineerUpdateData,
        });
        return { ...updatedData, role: 'SITE_ENGINEER' };
    }

    // Check Admin
    const adminProfile = await prisma.admin.findUnique({ where: { id } });
    if (adminProfile) {
        // Admins typically only update name and photo
        const { contactNumber, companyName,  ...adminUpdateData } = updateData;
        updatedData = await prisma.admin.update({
            where: { id },
            data: adminUpdateData,
        });
        return { ...updatedData, role: 'ADMIN' };
    }

    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found or invalid ID");
};
  export const authService = {
    login
  ,getMe,
  updateProfile}

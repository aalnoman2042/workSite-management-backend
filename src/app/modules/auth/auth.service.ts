import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import ApiError from "../../Error/apiError";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../../config";

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
    if (!user.approved) {throw new ApiError(403,"User not approved yet");}

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
    const accessToken = session.accessToken;
    const decodedData = jwtHelper.verifyToken(accessToken, config.jwt_secret as Secret);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
        }
    })

    const { id, email, role,} = userData;

    return {
        id,
        email,
        role,
      

    }

}

  export const authService = {
    login
  ,getMe}

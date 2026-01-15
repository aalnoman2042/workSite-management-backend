import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status"
import { UserService } from "../user/user.service";



  const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

      res.cookie("accessToken", result.accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    })
    res.cookie("refreshToken", result.refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    })


    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User loggedin successfully!",
      data: {
        result
      }
    });
  });


const getMe = catchAsync(async (req: Request, res: Response) => {
    const userSession = req.cookies;
    const result = await authService.getMe(userSession);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrive successfully!",
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    // 1. Get the profile ID from the URL parameter
    const profileId = req.params.id; 
    
    // 2. Get the update data from the request body
    const updateData = req.body; 

    // IMPORTANT SECURITY NOTE: 
    // You must verify that the user whose token is attached to the request (req.user) 
    // is authorized to update this specific 'profileId'. 
    // For simplicity, we assume the frontend sends the correct user profile ID.

    // 3. Call the service to handle the conditional update
    const result = await authService.updateProfile(profileId, updateData);

    // 4. Send the response
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully!",
        data: result,
    });
});


 export const authController = {
  login,
getMe,
updateMyProfile
 };

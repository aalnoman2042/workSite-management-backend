import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status"



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


 export const authController = {
  login,
getMe
 };

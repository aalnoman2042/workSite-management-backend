import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { getAISuggestions } from "./ai.service"

const getAISuggetions = catchAsync(async(req: Request, res: Response)=>{
    
    const result = await getAISuggestions(req.body)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "got your suggetions successfully!",
        data: result
    }) 
})


export const aiController = {
    getAISuggetions
}
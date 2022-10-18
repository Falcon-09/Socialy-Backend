import bcrypt from 'bcrypt'
import UserModel from '../models/userModel.js'
import {otpHandler} from '../utils/mail.js'
import OtpModel from '../models/otpModel.js'


export const verifyOtp = async(req,res) => {

    
    try {
        const {userId,otp} = req.body
        const user = await UserModel.findById(userId)
        if(!userId || !otp){
            res.status(404).json({message: "Otp required"})
        }else{
            const otpRecord = await OtpModel.find({userId})
            if(otpRecord.length <= 0){
                res.status(403).json({message: "otp invalid"})
            }else{
                const {expiresAt} = otpRecord[0]
                const hashedOtp = otpRecord[0].otp
                if(expiresAt<Date.now()){
                    await OtpModel.deleteMany({userId})
                    res.status(403).json({message: "otp expired"})
                }else{
                   const valid = await bcrypt.compare(otp,hashedOtp)
                   if(!valid) res.status(404).json({message: "otp not valid"})
                   else{
                    await UserModel.updateOne({_id: userId},{verified: true})
                    await OtpModel.deleteMany({userId})
                    const verifiedUser = await UserModel.findById(userId)
                    res.status(201).json(verifiedUser)
                   }
                }
            }
        }
    }
    catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const resendOtp = async(req,res) => {
    try {
        const {userId,username} = req.body

        if(!userId || !username){
            res.status(404).json({message: "No such user exists"})
        }
        else{
            await OtpModel.deleteMany({userId})
            otpHandler({_id: userId,username},res)
        }
    }
    catch (error) {
        res.status(500).json({message: error.message})
    }
}
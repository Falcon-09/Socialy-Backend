import nodemailer from 'nodemailer' 
import bcrypt from 'bcrypt'
import dotenv from 'dotenv' 
import OtpModel from '../models/otpModel.js'
import UserModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'


dotenv.config()

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_MAIL,
        pass: process.env.AUTH_PASS
    }
})

export const otpHandler = async(req,res) =>{
    const _id = req._id
    const username = req.username
    const user = await UserModel.findById(_id);
    const otp = `${Math.floor(1000+Math.random()*9000)}`

    const mailOptions = {
        from: process.env.AUTH_MAIL,
        to: username,
        subject: "Verify Your Email",
        html: `<p> Enter <b>${otp}</b> in the app to verify your email address and complete the verification process</p>
        <p>This code <b>expires in 5 minutes</b>.</p>`
    }
    try {
        const salt = 10
        const hashedOtp = await bcrypt.hash(otp,salt)
        const newOtp = await new OtpModel({
            userId: _id,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 300000
        })
        await newOtp.save()
        await transporter.sendMail(mailOptions)
        const token = jwt.sign(
            { username: user.username, id: user._id },
            process.env.JWTKEY,
            { expiresIn: "7d" }
          );
        return res.status(200).json({ user, token });
        
    }
    catch (error) {
        return res.status(500).json({message: error.message})
    }
}




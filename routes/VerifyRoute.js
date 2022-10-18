import express from 'express'
import {resendOtp,verifyOtp} from '../controllers/VerifyController.js'

const router = express.Router()

router.post('/resend',resendOtp)
router.post('/',verifyOtp)


export default router
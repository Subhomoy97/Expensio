const router=require('express').Router();
const authController=require('../controllers/auth.controller')
const authCheck=require('../middleware/auth.middleware')


router.post('/register',authController.registerUser);
router.post('/verify-otp',authController.verifyOtp);
router.post('/login',authController.loginUser);
router.post('/forgot-password',authController.forgetPassword);
router.post('/update-password',authCheck,authController.updatePassword);
router.post('/reset-password/:token',authController.resetPassword);


module.exports=router;

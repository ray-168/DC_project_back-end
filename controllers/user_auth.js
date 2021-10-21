// const { User, Application, Session }  = require('../db/models');
// const {User, Application, Session } = require('../db/models');
require('dotenv').config();
const {User,Session,Application} = require('../db/models');

const {sendMail} = require('../common/sendmail');
const {mailConfig,url} = require('../config/config');
const jwt = require('jsonwebtoken');
const { response } = require('../common/response');
const bcrypt = require('bcrypt');
const email_validator = require('email-validator');
const util = require('../common/util');
const {jwtConfig} = require('../config/config');



const sendEmailVerification = async function(req , registerUser){
    // user payload for important data
    const payload = {
        id:registerUser.id,
        email:registerUser.email,   
        role:registerUser.role
    };

    const registerToken = jwt.sign(payload, mailConfig.appEmailTokenSecret, {expiresIn:'30m'});
    const link = `${req.protocol}://localhost:3000/verification/${registerToken}`;
    const htmlText = `<h3>Hello ${payload.email}, welcome to Data center 2.0!</h3><br />
    <h2>Please, verify your email</h2><br/><br/>
    <a href="${link}">${link}!</a>`;
    const emailSubject = 'Email Verificatication';

    try{
        await sendMail(emailSubject, payload.email, htmlText);
        console.log(`success send email to ${payload.email}`);
        console.log(`token ${registerToken}`);
    }
    catch(err){ 
        console.log(err.message);
        console.log(`Fail send mail to ${payload.email}`);
    }
};
const sendEmailResetPassword = async function(req , user){
    // user payload for important data
    const payload = {
        id:user.id,
        email:user.email,   
        role:user.role
    };

    const resetPasswordToken = jwt.sign(payload, mailConfig.appResetPassswordTokenSecret, {expiresIn:'30m'});
    // const link = `${req.protocal}://${url.urlClient}/verification/${registerToken}`;
    // const link = 'https://www.w3schools.com/tags/att_a_href.asp'
    const link = `https://localhost:3000/reset-password/${resetPasswordToken}`;
    const htmlText = `<h3>Hello ${payload.email}, welcome to Data center 2.0!</h3><br/>
    <h2>Please, reset your though this link</h2><br/><br/>
    <a href="${link}">reset your password Now!</a>`;
    const emailSubject = 'Reset';

    try{
        await sendMail(emailSubject, payload.email, htmlText);
        console.log(`success send email to ${payload.email}`);
        // console.log(`token ${registerToken}`);
    }
    catch(err){ 
        console.log(err.message);
        console.log(`Fail send mail to ${payload.email}`);
    }
};

module.exports = {
    //  user register
    async userRegister (req ,res) {
        try{

            //user input information field
            const {username , email , password , confirmPassword} = req.body;

            if(!email){
                return res.status(400).send(response('email is require!'));
            }
            // check if email already exsits
            const finduser = await User.findOne({ where: { email: req.body.email } });

            if (finduser){
                return res.status(400).send(response('email is already exsits'));
            }

            if (!username){
                return res.status(400).send(response('username is require!'));
            } 
            if(!password){
                return res.status(400).send(response('password is require!'));
            }
            if(!confirmPassword){
                return res.status(400).send(response('confirm password is require!'));
            }
            const hashpassword = await bcrypt.hash(password , await bcrypt.genSalt(15));
            if(password!=confirmPassword){
                return res.status(400).send(response('confirm password not match!'));
            }
            if (!email_validator.validate(email)){
                return res.status(400).send(response('your email is invalid'))
            }


            const registerUser = await User.create({
                username:username,
                email:email,
                password:hashpassword,
                confirmPassword:confirmPassword,
                role:util.getUserRole(),
                isConfirm:false,
                profile:null,
                session:{
                    accessToken:null,
                    refreshToken:null
                }
            },{
                include:[{
                    model:Session,
                    as:'session'
                }]
            }) 

            sendEmailVerification(req, registerUser); 
            // sendEmailResetPassword(req,registerUser);

            return res.status(200).send(response('Register successful!! please verify with your email',{
                id:registerUser.id,
                username:registerUser.username,
                email:registerUser.email,
                password:registerUser.password,
                role:registerUser.role,
                isConfirm:registerUser.isConfirm
            }))
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Register fail!'));
        }
    },
    // user verify email
    async verifyEmail(req, res){
        try{
            
            const token = req.params.token;
            if (!token){
                return res.status(400).send(response('Email Verification fail'));
            }
            //verify token 
            const verifyToken = jwt.verify(token,mailConfig.appEmailTokenSecret,(err,payload)=>{
                if (err){
                    return res.status(400).send(response('No authorization token was found, Failed to verify Email'));
                }
                return payload;
            });
            const user = await User.findByPk(verifyToken.id);
            if (!user) {
                return res.status(400).send(response('Email verification failed, Please Login to verify again'));
            }

            if (user.isConfirm) {
                return res.status(400).send(response('Email is already confirmed, Please login!'));
            }

            await User.update({
                isConfirm: true
            }, {
                where: {
                    id: verifyToken.id
                }
            });

            return res.status(200).send(response('Email comfirmation successfully, Please Login Now', { payload: verifyToken }))

        }
        catch(err){

        }
    },

    //user login
    async userLogin(req, res) {
        try {
            // check required fields
            const { email, password } = req.body;
            if (!email) {
                return res.status(400).send(response('Email is required'))
            }

            if (!password) {
                return res.status(400).send(response('Password are required'))
            }

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(401).send(response('Invalid Email or Password'));
            } else {
                //check email confirmation
                if (!user.isConfirm) {
                    sendEmailVerification(req, user);
                    return res.status(401).send(response('Please check and verify your email before login'));
                }

                //compare passwords
                const passwordCompare = await bcrypt.compare(password, user.password);
                if (!passwordCompare) {
                    return res.status(401).send(response('Invalid Email or Password!'));
                }

                // issue token
                const payload = {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
                const token = jwt.sign(payload, jwtConfig.tokenSecret, { expiresIn: jwtConfig.tokenExpire });
                const refresh = jwt.sign(payload, jwtConfig.refreshTokenSecret, { expiresIn: jwtConfig.refreshTokenExpire });

                // update token in session table
                // this is used for one device login per session
                const session = await Session.findOne({ where: { userId: user.id } });
                if (!session) {
                    return res.status(400).send(response('Login failed'));
                }
                await Session.update({
                    accessToken: token,
                    refreshToken: refresh
                }, { where: { userId: user.id } });

                // response success login
                return res.status(200).send(response('Login successfully', {
                    userId: user.id,
                    token: token,
                    refreshToken: refresh,
                    isConfirm: user.isConfirm
                }));
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Login failed'));
        }
    },

    // verifyEmail:async (req,res)=>{
    //     try{
    //         const token = req.headers['authorization'].split(' ')[1];
    //         if (!token){
    //             return res.status(400).send(response('no authorization token was found'));
    //         }
    //         console.log(token)
    //     }catch(err){
    //         console.log(err.message);
    //         return res.status(500).send(response('fail to verify email'))
    //     }
    // },

    /* USER REFRESH TOKEN */
    userRefreshToken:async(req, res) =>{
        try {
            // check required fields
            const { refreshToken } = req.body
            if (!refreshToken) {
                return res.status(400).send(response('RefreshToken is required'));
            }

            // verify refresh token
            const userPayload = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret, (err, payload) => {
                if (err) {
                    return res.status(401).send(response('Token is invalid or expired'));
                }
                return payload;
            });

            // check refresh token in DB
            const user = await User.findOne({
                attributes: ['id', 'email', 'role'],
                where: { id: userPayload.id, isActive: true },
                include: [{
                    model: Session,
                    as: 'session',
                    attributes: [],
                    where: {
                        refreshToken: refreshToken
                    }
                }],
            });
            if (!user) {
                return res.status(401).send(response('Token is invalid or expired'));
            } else {
                // issue token
                const payload = {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
                const token = jwt.sign(payload, jwtConfig.tokenSecret, { expiresIn: jwtConfig.tokenExpire });
                const refresh = jwt.sign(payload, jwtConfig.refreshTokenSecret, { expiresIn: jwtConfig.refreshTokenExpire });

                // update token in session table
                // this is used for one device login per session
                await Session.update({
                    accessToken: token,
                    refreshToken: refresh
                }, { where: { userId: user.id } });

                return res.status(200).send(response('Token has been renew', { token: token, refreshToken: refresh }));
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed to get refresh token'));
        }
    },

    //USER CHANGE PASSWORD
    userChangePassword: async (req,res)=>{
        try{
            const {currentPassword,newPassword,confirmPassword} = req.body;
            // check input field
            if (!currentPassword){
                return res.status(400).send(response('your current password if require!!'));
            }
            if (!newPassword){
                return res.status(400).send(response('your new password if require!!'));
            }
            if (!confirmPassword){
                return res.status(400).send(response('your confirm password if require!!'));
            }

            //find user by id through user id from payload
            const userId = req.user.id;
            const user = await User.findByPk(userId);
            if (!user){
                return res.status(400).send(response('user not found!'));
            }

            // compare current password with user.id password

            const comparePassword = await bcrypt.compare(currentPassword,user.password);
            if (!comparePassword){
                return res.status(400).send(response('your cuurent password not match!'));
            }

            // hash new password
            const hashPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(15));
            await User.update({
                password:hashPassword
            },{     
                where:{id:user.id}
            })
            return res.status(200).send(response('successfull update password!'));
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to change password'));
        }
    },
    //USER FORGET PASSWORD
    async userForgetPassword(req,res){
        try{
             //check input field
            const {email} = req.body;
            if (!email){
                return res.status(400).send(response('email is require!!'));
            }
            if (!email_validator.validate(email)){
                return res.status(400).send(response('email is invalid!!'));
            }
            const user = await User.findOne({where:{email:email}});
            if(!user){
                return res.status(400).send(response('email not found!!'));
            }
            // sendResetpasswordEmail(req,user.dataValues);
            // console.log(user.id,user.email,user.role);
            sendEmailResetPassword(req,user);
            return res.status(200).send(response('successfull send reset password email!!'));

        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('forget password failed'));
        }
    },


    userResetPassword: async (req, res) => {
        try {
            // Take token from Header Bearer token or client side
            // Middleware Authentication
            // const token = req.headers['authorization'].split(' ')[1]
            const token = req.params.token;
            if (!token) {
                return res.status(400).send(response('No authorization token was found'));
            }
            console.log(`Bearer Token: ${token}`);

            // verify token
            const userPayload = jwt.verify(token, mailConfig.appResetPassswordTokenSecret, (err, payload) => {
                console.log(payload);
                if (err) {
                    return res.status(400).send(response('No authorization token was found, Failed to reset password'));
                }
                return payload;
            });

            const { newPassword, confirmPassword } = req.body;

            if (!newPassword) {
                return res.status(400).send(response('New Password is required!'));
            }
            if (!confirmPassword) {
                return res.status(400).send(response('Confirm New Password is required!'));
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).send(response('New Password and Confirm Password not matched'));
            }

            // Generate Hash password
            const salt = await bcrypt.genSalt(12);
            const hashNewPassword = await bcrypt.hash(newPassword, salt);

            const user = await User.findByPk(userPayload.id);

            if (!user) {
                return res.status(404).send(response('User not found'));
            }

            if (!user.isConfirm) {
                return res.status(400).send(response('Your account is not confirmed yet'));
            }

            // assign hashNewPassword into password
            if (hashNewPassword) {
                user.password = hashNewPassword;
            }

            // update user password
            await User.update(user.dataValues, { where: { id: userPayload.id } });

            return res.status(200).send(response(`Your password has been reset successfully. Please Login!`));
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed to reset password'));
        }
    },

    /* USER LOGOUT */
    async userLogout(req, res) {
        try {
            // update token in session table after logout
            await Session.update({
                accessToken: null,
                refreshToken: null
            }, { where: { userId: req.user.id } });
    
            return res.status(200).send(response('Logout successfully'));
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Logout failed'));
        }
    },
}
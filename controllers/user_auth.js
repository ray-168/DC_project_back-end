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
const {passwordValidation} = require('../common/validation');
const {originalProfileName} = require('../common/upload_profile');

const sendEmailVerification = async function(req , registerUser){
    // user payload for important data
    const payload = {
        id:registerUser.id,
        email:registerUser.email,   
        role:registerUser.role
    };

    const registerToken = jwt.sign(payload, mailConfig.appEmailTokenSecret, {expiresIn:'30m'});
    // const link = `${req.protocol}://localhost:3000/verification/${registerToken}`;
    const  link = req.protocol + '://' + req.get('host') + '/verification' +`/${registerToken}`;
    
    const html = `<h3>Hello ${payload.email}, welcome to Data center 2.0!</h3><br />
    <p style="margin: 0;">We're Excited To Have You Get Started. First, You Need To Confirm Your Account. Just Press The Button Below.</p><br/><br/>
    <a href="${link}">Verify Now!</a>`;
    const emailSubject = 'Email Verificatication';

    try{
        await sendMail(emailSubject, payload.email, html);
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

    const link = process.env.CLIENT_RESETPASSWORD+`?${resetPasswordToken}`;
    
    // const link = `https://localhost:3000/reset-password/${resetPasswordToken}`;
    const html = `<h3>Hello ${payload.email}, welcome to Data center 2.0!</h3><br/>
    <p style="margin: 0;">We're Excited To Have You Get Started.We're Here To Help Your Problem.Click The Button Below To Reset Your Password</p><br/><br/>
    <a href="${link}" style="font-size:'large';" >Reset Your Password Now!</a>`;
    
    const emailSubject = 'ResetPasssword';

    try{
        await sendMail(emailSubject, payload.email,html);
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
            
            if (!username){
                return res.status(400).send(response('Username Is Require!'));
                // req.flash("message","username is require")
                // return res.status(400).redirect('/users/register')
            } 
            if(!email){
                return res.status(400).send(response('Email Is Require!'));
                
                // req.flash("message","Email is require")
                // return res.status(400).redirect('/users/register')
            }
            // check if email already exsits
            const finduser = await User.findOne({ where: { email: req.body.email } });

            if (finduser){
                return res.status(400).send(response('Email Is Already Exsits'));
                // req.flash("message","Email is already exists")
                // return res.status(400).redirect('/users/register')
            }

           
            if(!password){
                return res.status(400).send(response('Password Is Require!'));
                // req.flash("message","password is require")
                // return res.status(400).redirect('/users/register')
            }
            if(!passwordValidation(password)){
                return res.status(400).send(response('Your Password Should Contain At Least One Uppercase One Lowercase One Number And Length Between 8 To 20 Characters'));
                // req.flash("message","your password should contain at least one upper case, one lower case , one number and length between 8 to 20 characters")
                // return res.status(400).redirect('/users/register')
            }
            if(!confirmPassword){
                return res.status(400).send(response('Confirm Password Is Require!'));
                // req.flash("message","confirm password is require!")
                // return res.status(400).redirect('/users/register')
            }
            const hashpassword = await bcrypt.hash(password , await bcrypt.genSalt(15));
            if(password!=confirmPassword){
                return res.status(400).send(response('Confirm Password Not Match!'));
                // req.flash("message","confirm password and password is not match!")
                // return res.status(400).redirect('/users/register')
            }
            if (!email_validator.validate(email)){
                return res.status(400).send(response('Your Email Is Invalid'))
                // req.flash("message","nvalid email address. Valid e-mail can contain only latin letters, numbers, '@' and '.'")
                // return res.status(400).redirect('/users/register')
            }
            if(email.split('@')[1] !='kit.edu.kh'){
                return res.status(400).send(response('Only Kirirom Institute Technology Email Are Allow. Other Way You Can Sign Your KIT Email With Google Below'))
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
        

            return res.status(200).send(response('Register Successful!! Please Verify Your Email Before Login',{
                id:registerUser.id,
                username:registerUser.username,
                email:registerUser.email,
                password:registerUser.password,
                role:registerUser.role,
                isConfirm:registerUser.isConfirm
            }))
            
            // res.status(400).redirect('/users/app')
            

        }
        catch(err){
            console.log(err.message);
            return req.flash("Error","Fail To Register ")
            // return res.status(500).send(response('Register fail!'));
        }
    },
    // user verify email
    async verifyEmail(req, res){
        try{
            
            const token = req.params.token;
            if (!token){
                return res.status(400).send(response('Email Verification Fail'));
            }
            //verify token 
            const verifyToken = jwt.verify(token,mailConfig.appEmailTokenSecret,(err,payload)=>{
                if (err){
                    return res.status(400).send(response('No Authorization Token Was Found, Failed To Verify Email'));
                }
                return payload;
            });
            const user = await User.findByPk(verifyToken.id);
            if (!user) {
                return res.status(400).send(response('Email Verification Failed, Please Login To Verify Again'));
            }
            if (user.isConfirm) {
                return res.status(200).render("email_verify",{message:'Emali Is Already Confirmed'});
            }

            await User.update({
                isConfirm: true
            }, {
                where: {
                    id: verifyToken.id
                }
            });

            return res.status(200).render("email_verify",{message:'Successful Confirmed'});

        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Verify Failed'));
        }
    },

    //user login
    async userLogin(req, res) {
        try {
            // check required fields
            const { email, password } = req.body;
            if (!email) {
                
                // req.flash('message',"Email is require")
                // return res.redirect('/users/login');
                res.status(400).send(response('Email Is Required'))
            }

            if (!password) {
                return res.status(400).send(response('Password are required'))
                // req.flash('message',"password is require")
                // return res.redirect('/users/login');
            }

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).send(response('Invalid Email Or Password'));
                // req.flash('message',"Email not register yet. You can sign in with google below")
                // return res.redirect('/users/login');
            } else {
                //check email confirmation
                if (!user.isConfirm) {
                    sendEmailVerification(req, user);
                    return res.status(400).send(response('Please Check And Verify Your Email Before Login'));
                    // req.flash('message',"please check and verify your email before login!!")
                    // return res.redirect('/users/login');
                }
                if (!user.password){
                    return res.status(400).send(response('Your Emai Has Been Sign With Google!!Please Sign With Your Google Acc'));
                }

                //compare passwords
                const passwordCompare = await bcrypt.compare(password, user.password);
                if (!passwordCompare) {
                    return res.status(400).send(response('Invalid Email Or Password!'));
                    // req.flash('message',"Invalid Email or password")
                    // return res.redirect('/users/login');
                }

                const session = await Session.findOne({ where: { userId: user.id } });

                if (session.dataValues.accessToken){
                     // response success login
                    return res.status(200).send(response('Login Successfully', {
                        userId: user.id,
                        token: session.dataValues.accessToken,
                        refreshToken: session.dataValues.refreshToken,
                        isConfirm: user.isConfirm, 
                        role:user.role
                    }));
                }

                if(!session.dataValues.accessToken){
                     // issue token
                    const payload = {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    }
                    const token = jwt.sign(payload, jwtConfig.tokenSecret, { expiresIn: jwtConfig.tokenExpire });
                    const refresh = jwt.sign(payload, jwtConfig.refreshTokenSecret, { expiresIn: jwtConfig.refreshTokenExpire });
                    
                    await Session.update({
                        accessToken: token,
                        refreshToken: refresh
                    }, { where: { userId: user.id } });
    
                    // response success login
                    return res.status(200).send(response('Login Successfully', {
                        userId: user.id,
                        token: token,
                        refreshToken: refresh,
                        isConfirm: user.isConfirm,
                        role:user.role
                    }));
                
                } 
               
                if (!session) {
                    return res.status(400).send(response('Login Failed'));
                }
                
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Login Failed'));
            // req.flash('message',"Fail to login . please try again")
            // return res.redirect('/users/login');
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
                return res.status(400).send(response('RefreshToken Is Required'));
            }

            // verify refresh token
            const userPayload = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret, (err, payload) => {
                if (err) {
                    return res.status(401).send(response('Token Is Invalid Or Expired'));
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
                return res.status(401).send(response('Token Is Invalid Or Expired'));
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

                return res.status(200).send(response('Token Has Been Renew', { token: token, refreshToken: refresh }));
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed To Get Refresh Token'));
        }
    },

    //USER CHANGE PASSWORD
    userChangePassword: async (req,res)=>{
        try {
            // params user id from user token
            const userId = req.user.id;

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).send(response('User Not Found'));
            }
            if(!user.password){
                return res.status(404).send(response('Your Email Has Been Sign With Google. You Can Not Change Any Password'))
            }

            // Check required fields
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!currentPassword) {
                return res.status(400).send(response('Current Password Is Required'));
            }
            if (!newPassword) {
                return res.status(400).send(response('New Password Is Required'));
            }
            if (!confirmPassword) {
                return res.status(400).send(response('Confirm New Password Is Required'));
            }

            //compare currentPassword with user.password in DB
            const currentPasswordCompare = await bcrypt.compare(currentPassword, user.password);
            if (!currentPasswordCompare) {
                return res.status(400).send(response('Input Wrong Current Password'));
            }

            if (!passwordValidation(newPassword)) {
                return res.status(400).send(response('Password Should Contains At Least One Numeric Digit One Uppercase And One Lowercase Letter Between 8 To 20 Characters'));
            }

            // Compare New Password with Confirm New Password
            if (!(newPassword === confirmPassword)) {
                return res.status(400).send(response('New Password And Confirm New Password Not Matched'));
            }

            //compare newPassword with user.password in DB
            const newPasswordCompare = await bcrypt.compare(newPassword, user.password);
            if (newPasswordCompare) {
                return res.status(400).send(response('Your New Password And Current Password Are The Same! Please Input Another New Password'));
            }

            // Generate Hash new password
            const salt = await bcrypt.genSalt(12);
            const hashNewPassword = await bcrypt.hash(newPassword, salt);

            // assign hashNewPassword into user.password in DB
            if (hashNewPassword) {
                user.password = hashNewPassword;
            }

            // update or change user password
            await User.update(user.dataValues, { where: { id: userId } });

            return res.status(200).send(response('Your Password Has Been Changed Successfully'));
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send(response("Failed To Change Password"));
        }

    },
    //USER FORGET PASSWORD
    async userForgetPassword(req,res){
        try{
             //check input field
            const {email} = req.body;
            if (!email){
                return res.status(400).send(response('Email Is Require!!'));
            }
            if (!email_validator.validate(email)){
                return res.status(400).send(response('Email Is Invalid!!'));
            }
            const user = await User.findOne({where:{email:email}});
            if(!user){
                return res.status(400).send(response('Email Not Found!!'));
            }
            if(!user.isConfirm){
                return res.status(400).send(response('Your Email Did Not Confirm Yet. Please Go To Confirm Your Email!!'));
            }
            // sendResetpasswordEmail(req,user.dataValues);
            // console.log(user.id,user.email,user.role);
            sendEmailResetPassword(req,user);
            return res.status(200).send(response('Successful Send Reset Password Email!!'));

        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('Forget Password Failed'));
        }
    },


    userResetPassword: async (req, res) => {
        try {
            // Take token from Header Bearer token or client side
            // Middleware Authentication
            // const token = req.headers['authorization'].split(' ')[1]
            const token = req.headers['authorization'].split(' ')[1]
            if (!token) {
                return res.status(400).send(response('No Authorization Token Was Found'));
            }
            

            // verify token
            const userPayload = jwt.verify(token, mailConfig.appResetPassswordTokenSecret, (err, payload) => {
                if (err) {
                    return res.status(400).send(response('No Authorization Token Was Found, Failed To Reset Password'));
                }
                return payload;
            });

            const { newPassword, confirmPassword } = req.body;

            if (!newPassword) {
                return res.status(400).send(response('New Password Is Required!'));
            }
            if (!confirmPassword) {
                return res.status(400).send(response('Confirm New Password Is Required!'));
            }
            if(!passwordValidation(newPassword)){
                return res.status(400).send(response('Your Password Should Contain At Least One Uppercase One Lowercase One Number And Length Between 8 To 20 Characters'));
                // req.flash("message","your password should contain at least one upper case, one lower case , one number and length between 8 to 20 characters")
                // return res.status(400).redirect('/users/register')
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).send(response('New Password And Confirm Password Not Matched'));
            }

            // Generate Hash password
            const salt = await bcrypt.genSalt(12);
            const hashNewPassword = await bcrypt.hash(newPassword, salt);

            const user = await User.findByPk(userPayload.id);

            if (!user) {
                return res.status(404).send(response('User Not Found'));
            }

            if (!user.isConfirm) {
                return res.status(400).send(response('Your Account Is Not Confirmed Yet'));
            }

            // assign hashNewPassword into password
            if (hashNewPassword) {
                user.password = hashNewPassword;
            }

            // update user password
            await User.update(user.dataValues, { where: { id: userPayload.id } });

            return res.status(200).send(response(`Your Password Has Been Reset Successfully. Please Login!`));
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed To Reset Password'));
        }
    },
    
    // USER GET PROFILE
     userGetProfile:async (req,res)=>{
        try{
            //get user id from token
            const userId = req.user.id;
            const user = await User.findByPk(userId,{attributes:{exclude:['password']}});
            if (!user){
                return res.status(404).send(response('User Not Found'));
            }

            return res.status(200).send(response('Successful Get Your Profile', user));
        }catch (err){
            console.log(err.message);
            return res.status(500).send(response('Failed To Get Profile'));   
        }
    },
    // USER UPDATE PROFILE
     userUpdateProfile:async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password', 'role'] }
            });

            if (!user) {
                return res.status(404).send(response('User Not Found'));
            }
            // required fields for update
            const { username } = req.body;
            const profile = req.file;
            const profilePath = req.protocol + '://' + req.get('host') + `/userprofile/userId${userId}/${originalProfileName}`;
            
            if (profile) {
                if (profile.size > 5 * 1000 * 1000) {
                    return res.status(400).send(response('Please Upload Image File Size Less Than Or Equal To 5MB'));
                }else{
                    user.profile=profilePath
                }
            }
            // limit file size
            
            

  
            // console.log("profile", profile)
            if (username) { user.username = username };
            if (profile) {user.profile = profilePath}

            // update user
            await User.update(user.dataValues, { where: { id:userId} });

            return res.status(200).send(response('Successfully Updated', user));
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed To Update Your Profile'))
        }
    },

    // FIND USER BY TOKEN
    async findUser(req,res){
        try{
            const {token} = req.body;
            if (!token){
                return res.status(400).send(response('Token Is Require'));
            }
            const session = await Session.findOne({where:{accessToken:token},
                include:{ 
                    model:User,
                    as:'user' 
            }})
            return res.status(200).send(response('Successful Find User',session.user.dataValues));
            // console.log(session.user.dataValues) 
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Find User'));
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
    
    
            return res.status(200).send(response('Logout Successfully'));
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Logout Failed'));
        }
    },


}
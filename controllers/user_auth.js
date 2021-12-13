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
    
    const htmlText = `<h3>Hello ${payload.email}, welcome to Data center 2.0!</h3><br />
    <h2>Please, verify your email</h2><br/><br/>
    <a href="${link}">verify now!</a>`;
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
    const link = req.protocol + '://' + req.get('host') + '/reset-password' + `/${resetPasswordToken}`;
    
    // const link = `https://localhost:3000/reset-password/${resetPasswordToken}`;
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
            
            if (!username){
                return res.status(400).send(response('username is require!'));
                // req.flash("message","username is require")
                // return res.status(400).redirect('/users/register')
            } 
            if(!email){
                return res.status(400).send(response('email is require!'));
                
                // req.flash("message","Email is require")
                // return res.status(400).redirect('/users/register')
            }
            // check if email already exsits
            const finduser = await User.findOne({ where: { email: req.body.email } });

            if (finduser){
                return res.status(400).send(response('email is already exsits'));
                // req.flash("message","Email is already exists")
                // return res.status(400).redirect('/users/register')
            }

           
            if(!password){
                return res.status(400).send(response('password is require!'));
                // req.flash("message","password is require")
                // return res.status(400).redirect('/users/register')
            }
            if(!passwordValidation(password)){
                return res.status(400).send(response('your password should contain at least one upper case, one lower case , one number and length between 8 to 20 characters'));
                // req.flash("message","your password should contain at least one upper case, one lower case , one number and length between 8 to 20 characters")
                // return res.status(400).redirect('/users/register')
            }
            if(!confirmPassword){
                return res.status(400).send(response('confirm password is require!'));
                // req.flash("message","confirm password is require!")
                // return res.status(400).redirect('/users/register')
            }
            const hashpassword = await bcrypt.hash(password , await bcrypt.genSalt(15));
            if(password!=confirmPassword){
                return res.status(400).send(response('confirm password not match!'));
                // req.flash("message","confirm password and password is not match!")
                // return res.status(400).redirect('/users/register')
            }
            if (!email_validator.validate(email)){
                return res.status(400).send(response('your email is invalid'))
                // req.flash("message","nvalid email address. Valid e-mail can contain only latin letters, numbers, '@' and '.'")
                // return res.status(400).redirect('/users/register')
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
        

            return res.status(200).send(response('Register successful!! please verify your email before login',{
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
            return req.flash("Error","Fail to register ")
            // return res.status(500).send(response('Register fail!'));
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
                return res.status(200).render("email_verify",{message:'Emali is already confirmed'});
            }

            await User.update({
                isConfirm: true
            }, {
                where: {
                    id: verifyToken.id
                }
            });

            return res.status(200).render("email_verify",{message:'Successfull confirmed'});

        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Verify failed'));
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
                res.status(400).send(response('Email is required'))
            }

            if (!password) {
                return res.status(400).send(response('Password are required'))
                // req.flash('message',"password is require")
                // return res.redirect('/users/login');
            }

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).send(response('Invalid Email or Password'));
                // req.flash('message',"Email not register yet. You can sign in with google below")
                // return res.redirect('/users/login');
            } else {
                //check email confirmation
                if (!user.isConfirm) {
                    sendEmailVerification(req, user);
                    return res.status(400).send(response('Please check and verify your email before login'));
                    // req.flash('message',"please check and verify your email before login!!")
                    // return res.redirect('/users/login');
                }
                if (!user.password){
                    return res.status(400).send(response('Your emai have been sign with google!!Please sign with your google acc'));
                }

                //compare passwords
                const passwordCompare = await bcrypt.compare(password, user.password);
                if (!passwordCompare) {
                    return res.status(400).send(response('Invalid Email or Password!'));
                    // req.flash('message',"Invalid Email or password")
                    // return res.redirect('/users/login');
                }

                const session = await Session.findOne({ where: { userId: user.id } });

                if (session.dataValues.accessToken){
                     // response success login
                    return res.status(200).send(response('Login successfully', {
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
                    return res.status(200).send(response('Login successfully', {
                        userId: user.id,
                        token: token,
                        refreshToken: refresh,
                        isConfirm: user.isConfirm,
                        role:user.role
                    }));
                
                } 
               
                if (!session) {
                    return res.status(400).send(response('Login failed'));
                }
                
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Login failed'));
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
            if(!passwordValidation(newPassword)){
                return res.status(400).send(response('your password should contain at least one upper case, one lower case , one number and length between 8 to 20 characters'));
    
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
                return res.status(400).send(response('your cuurent password not correct!'));
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
    
    // USER GET PROFILE
     userGetProfile:async (req,res)=>{
        try{
            //get user id from token
            const userId = req.user.id;
            const user = await User.findByPk(userId,{attributes:{exclude:['password']}});
            if (!user){
                return res.status(404).send(response('user not found'));
            }

            return res.status(200).send(response('Success to get your profile', user));
        }catch (err){
            console.log(err.message);
            return res.status(500).send(response('Failed to get profile'));   
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
                return res.status(404).send(response(' user not found'));
            }
            // required fields for update
            const { username } = req.body;
            const profile = req.file;

            if (!profile) {
                return res.status(400).send(response('Please upload an image file'));
            }
            // limit file size
            if (profile.size > 5 * 1000 * 1000) {
                return res.status(400).send(response('File to large, Please upload avatar image fileSize less than or equal to 5MB'));
            }
            if(!username){
                return res.status(400).send(response(' user name can not empty'));
            }

            const profilePath = req.protocol + '://' + req.get('host') + `/userprofile/userId${userId}/${originalProfileName}`;
  
            // console.log("profile", profile)
            if (username) { user.username = username };
            if (profile) {user.profile = profilePath}

            // update user
            await User.update(user.dataValues, { where: { id:userId} });

            return res.status(200).send(response('successfully updated', user));
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send(response('Failed to update your profile'))
        }
    },

    // FIND USER BY TOKEN
    async findUser(req,res){
        try{
            const {token} = req.body;
            if (!token){
                return res.status(400).send(response('token is require'));
            }
            const session = await Session.findOne({where:{accessToken:token},
                include:{ 
                    model:User,
                    as:'user' 
            }})
            return res.status(200).send(response('successful find user',session.user.dataValues));
            // console.log(session.user.dataValues) 
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to find user'));
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
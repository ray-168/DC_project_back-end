const {Application,User,Session, Sequelize} = require('../db/models');
const {response} = require('../common/response');
const {passwordValidation,textValidation,urlValidation} = require('../common/validation');
const {getAdminRole,getUserRole,getModeratorRole} = require('../common/util');
const {originalImgName} = require('../common/upload_appImage')
const Op = Sequelize.Op;
module.exports = {
    // get all app that have been approve
    async getApproveApp (req ,res) {
        try{
            // GET ONLY APPROVAL APPLICATION
            const app = await Application.findAll({where:{isApprove:true},
                include:{
                    model:User,
                    as:'user'
                },order:[['createdAt','DESC']]
                
            });
            return res.status(200).send(response('Successful Get Application',app))
        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Get Application'))
        }
    },
    // get all app haven't been approve yet
    async getNoneApproveApp (req ,res) {
        try{
            // GET ONLY APPROVAL APPLICATION
            const app = await Application.findAll({where:{isApprove:false},
                include:{
                    model:User,
                    as:'user'
                },order:[['createdAt','DESC']]
            });
            return res.status(200).send(response('Successful Get Application',app))
        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Get Application'))
        }
    },
    // super admin approve app user request
    async approveApp(req,res){
        try{
            const appId = req.params.id;
            // check if app exist in db
            const app = await Application.findByPk(appId);
            if (!app){
                return res.status(400).send(response('App Not Found'));
            }
            if (app.isApprove){
                return res.status(400).send(response('App Already Approve'))
            }
            await Application.update({isApprove:true},{where:{id:app.id}});
            return res.status(200).send(response('Successful Approve App'));
        }   
        catch(err){
            console.log(err.message);
            return res.status(500).send(response(' Fail To Approve Application'))
        }
    },
    // super admin deny app user request
    async denyApp(req,res){
        try{
            const appId = req.params.id;
            const app = await Application.findByPk(appId);
            if (!app){
                return res.status(400).send(response('App Not Found'));
            }
            if(app.isApprove){
                return res.status(500).send(response('App Already Approved. You Can Not Deny'));
            }
            const denyApp = await Application.destroy({where:{id:app.id,isApprove:false}});
            return res.status(200).send(response('Request Have Been Deny',denyApp));

        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Deny App'));
        }
    },
    //super admin deleted app
    async deleteApp(req,res){
        try{
            const appId = req.params.id;
            //find app in db
            const app = await Application.findByPk(appId);
            if(!app){
                return res.status(400).send(response('App Not Found'));
            }
            const deletedApp = await Application.destroy({where:{id:app.id}});
            return res.status(200).send(response('Successful Deny App',deletedApp));
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Delete App'));
        }
    },
    //super admin edit application 
    async editApp(req,res){
        try{
            const appId = req.params.id;
            const userId = req.user.id
            // check if app not avilable in db
            const app = await Application.findByPk(appId);
            // require feild 
            
            const {appName , appUrl, description } = req.body;
            const appImage = req.file;
            // console.log(appName,appImage)
            
            if (!app){
                return res.status(400).send(response('App Not Found'));
            }
            if(!app.isApprove){
                return res.status(400).send(response('App Did Not Approve Yet. You Must Approve It First Before Edit'));
            }
            const imagePath = req.protocol + '://' + req.get('host') + `/appImage/userId${userId}/${originalImgName}`; 
            if(appImage){
                if (appImage.size > 5 * 1000 * 1000) {
                    return res.status(400).send(response('Please Upload Image File Size Less Than Or Equal To 5MB'));
                }
                else{
                    app.appImage=imagePath
                }
            }
            if (!textValidation(appName)){
                return res.status(400).send(response('User Name Allow Only Character Aa-Zz Number 0-9 And Space'));
            }
            if(appName){
                app.appName=appName
            }
            if(appUrl){
                if (!urlValidation(appUrl)){
                    return res.status(400).send(response('App Url Must Be Public Begin With Http Or Https And Symbols Allow Only[:/?=#_-.@+~]'));
                }
                app.appUrl=appUrl
            }
            if (!textValidation(description)){
                return res.status(400).send(response('Description Allow Only Character Aa-Zz Number 0-9 And Space'));
            }
            if(description){
                app.description=description
            }
            await Application.update(app.dataValues,{where:{
                id:app.id
            }})
            const updateApp = await Application.findByPk(appId);
            return res.status(200).send(response('Successful Update Application',{
                appNmae:updateApp.appName,
                appImg:updateApp.appImage,
                appUrl:updateApp.appUrl,
                description:updateApp.description
            }));
        }
        catch (err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Edit App'));
        }
    },
    //super admin change other user role
    async changeRole(req,res){
        try{
            const userId = req.params.id;
            // check if user exsit in db
            const user = await User.findByPk(userId,{
                include:{
                    model:Session,
                    as:'session'
                }
            });
            if (!user){
                return res.status(400).send(response('User Not Found'));
            }
            const {role} = req.body;
            if (role == 'admin'){
                user.role = getAdminRole();
                await User.update({
                    role:user.role
                },{
                    where:{
                        id:user.id
                    }
                });
            }
            else if (role == 'moderator'){
                user.role = getModeratorRole()
                await User.update({
                    role:user.role
                },{
                    where:{
                        id:user.id
                    }
                });
            }
            else if (role == 'user'){
                user.role = getUserRole();
                await User.update({
                    role:user.role
                },{
                    where:{
                        id:user.id
                    }
                });
            }
            // update session of that user after changing role 
            await Session.update({
                accessToken:null,
                refreshToken:null,
            },{
                where:{
                    id:user.session.id
                }
            })
            return res.status(200).send(response(`Successful Change User To Role ${role}`,{
                id:user.id,
                username:user.username,
                email:user.email,
                role:user.role,
                isConfirm:user.isConfirm,
                createdAt:user.createdAt,
                updatedAt:user.updatedAt,
                session:{
                    accessToken:user.session.accessToken,
                    refreshToken:user.session.refreshToken
                }
            }));
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Change User Role')); 
        }
    },
    // all user 
    async allUser(req,res){
        try{
            const userId = req.user.id;
            const allUsers = await User.findAll({
                where:{
                    id:{
                        [Op.notIn]: [1,userId]
                    },
                    isConfirm:true
                },order:[['createdAt','DESC']]
            });
            return res.status(200).send(response('Successful Change User Role',allUsers))

        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Get All User')); 
        }
    } 
}

const {Application,User,Session, Sequelize} = require('../db/models');
const {response} = require('../common/response')
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
            return res.status(200).send(response('success get application',app))
        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to get application'))
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
            return res.status(200).send(response('success get application',app))
        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to get application'))
        }
    },
    // super admin approve app user request
    async approveApp(req,res){
        try{
            const appId = req.params.id;
            // check if app exist in db
            const app = await Application.findByPk(appId);
            if (!app){
                return res.status(400).send(response('app not found'));
            }
            if (app.isApprove){
                return res.status(400).send(response('app already approve'))
            }
            await Application.update({isApprove:true},{where:{id:app.id}});
            return res.status(200).send(response('successful approve app'));
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
                return res.status(400).send(response('app not found'));
            }
            if(app.isApprove){
                return res.status(500).send(response('app already approved. you can not deny'));
            }
            const denyApp = await Application.destroy({where:{id:app.id,isApprove:false}});
            return res.status(200).send(response('Request have been deny',denyApp));

        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to deny app'));
        }
    },
    //super admin deleted app
    async deleteApp(req,res){
        try{
            const appId = req.params.id;
            //find app in db
            const app = await Application.findByPk(appId);
            if(!app){
                return res.status(400).send(response('app not found'));
            }
            const deletedApp = await Application.destroy({where:{id:app.id}});
            return res.status(200).send(response('successfull deny app',deletedApp));
        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to delete app'));
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
                return res.status(400).send(response('app not found'));
            }
            if(!app.isApprove){
                return res.status(400).send(response('app did not approve yet. you must go and approve it first before edit'));
            }
            const imagePath = req.protocol + '://' + req.get('host') + `/appImage/userId${userId}/${originalImgName}`; 
            if(appImage){
                if (appImage.size > 5 * 1000 * 1000) {
                    return res.status(400).send(response('File to large, Please upload avatar image fileSize less than or equal to 5MB'));
                }
                else{
                    app.appImage=imagePath
                }
            }
            if(appName){
                app.appName=appName
            }
            if(appUrl){
                app.appUrl=appUrl
            }
            if(description){
                app.description=description
            }
            await Application.update(app.dataValues,{where:{
                id:app.id
            }})
            const updateApp = await Application.findByPk(appId);
            return res.status(200).send(response('successful update application',{
                appNmae:updateApp.appName,
                appImg:updateApp.appImage,
                appUrl:updateApp.appUrl,
                description:updateApp.description
            }));
        }
        catch (err){
            console.log(err.message);
            return res.status(500).send(response('fail to edit app'));
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
                return res.status(400).send(response('user not found'));
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
            return res.status(200).send(response(`successful change user to role ${role}`,{
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
            return res.status(500).send(response('fail to change user role')); 
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
                    }
                    ,isConfirm:true
                }
            });
            return res.status(200).send(response('successful change user role',allUsers))

        }
        catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to get all user')); 
        }
    } 
}

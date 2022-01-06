const {response} = require('../common/response');
const {User, Session, Application} = require('../db/models');
const {originalImgName} = require('../common/upload_appImage');
const {passwordValidation,textValidation,urlValidation} = require('../common/validation');

module.exports = {

    // USER GET LEADNING PAGE

    // USER GET ALL APPLICATION BY ID
    async getApplication (req ,res) {
        try{
            // GET ONLY APPROVAL APPLICATION
            const app = await Application.findAll({where:{isApprove:true},oder:['createAt','DESC']});
            return res.status(200).send(response("successful get all approve app",app))
        }catch(err){
            console.log(err.message);
     
            return res.status(500).send(response('fail to get application'))
        }
    },

    //USER ADD NEW APPLICATION
    async createApllication (req ,res){
        try{
            // check require field
            const {appName,appUrl,description} = req.body;

            const userId  = req.user.id;
            // check upload image feild
            const appImage = req.file;
            console.log(appImage)

            if (!appName){
                return res.status(400).send(response('Application Name Is Require'));
            }
            if (!textValidation(appName)){
                return res.status(400).send(response('App Name Allow Only Charactor Aa-Zz number 0-9 And Space'));
            }
            if (!appUrl){
                return res.status(400).send(response('Application Url Is Require'));
            }
            if (!urlValidation(appUrl)){
                return res.status(400).send(response('App Url Symbols Allow Only[:/?=#_-.@+~]'));
            }
            if (!appImage){
                return res.status(400).send(response('Application Image Is Require'));
            }
            if (appImage.size > 5 * 1000 * 1000) {
                return res.status(400).send(response('Please Upload Image File Size Less Than Or Equal To 5MB'));
            }
            // get app image path in server
            const imagePath = req.protocol + '://' + req.get('host') + `/appImage/userId${userId}/${originalImgName}`; 

            const app = await Application.create({
                userId:userId,
                appName:appName,
                appUrl:appUrl,
                description:description,
                appImage:imagePath,
                isApprove:false,
            })
            return res.status(200).send(response('Successful Post New Application. Please Wait For An Approval',{
                userId:app.userId,
                appName:app.appName,
                appUrl:app.appUrl,
                description:app.description,
                appImage:app.appImage,
                isApprove:app.isApprove
            }));


        }
        catch (err){
            console.log(err.message);
            return res.status(500).send(response('Fail To Post New Application'));
        }
    }
}
const {response} = require('../common/response');
const {User, Session, Application} = require('../db/models');

module.exports = {

    // USER GET ALL APPLICATION BY ID
    async userGetApplication (req ,res) {
        try{
            // GET ONLY APPROVAL APPLICATION
            const app = await Application.findAll({where:{isApprove:true}});
            return res.status(200).send(response('success get application',app))
        }catch(err){
            console.log(err.message);
            return res.status(500).send(response('fail to get application'))
        }
    },

    //USER ADD NEW APPLICATION
    async userAddNewApllication (req ,res){
        try{
            // check require field
            const {appName,appUrl,description,appImage} = req.body;
            const userId  = req.user.id;
 
            if (!appName){
                return res.status(400).send(response('application name is require'));
            }
            if (!appUrl){
                return res.status(400).send(response('application url is require'));
            }
            if (!description){
                return res.status(400).send(response('application description is require'));
            }
            if (!appImage){
                return res.status(400).send(response('application image is require'));
            }
            // CHECK IF APPLICATION IS ALREADY EXIST IN DB

            const app = await Application.create({
                userId:userId,
                appName:appName,
                appUrl:appUrl,
                description:description,
                appImage:appImage,
                isApprove:false,
            })
            return res.status(200).send(response('successfull post new application. please wait for an approval',{
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
            return res.status(500).send(response('fail to post new application'));
        }
    }
}
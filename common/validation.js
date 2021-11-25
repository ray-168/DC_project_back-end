const passwordValidation = function(password){
    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
    if (String(password).match(reg)){
        return true;
    }else{
        return false;
    }
}
module.exports = {passwordValidation};
const passwordValidation = function(password){
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])([^<>!@#$%^&*()`'".,:/|]){8,20}/g;
    if (String(password).match(regex)){
        return true;
    }else{
        return false;
    }
}

const textValidation = function(text){
    const regex = /^([aA-zZ,0-9, ]*)$/g
    if(String(text).match(regex)){
        return true
    }else{
        return false
    }
}
const urlValidation = function(url){
    const regex = /^([(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))$/g
    if(String(url).match(regex)){
        return true
    }else{
        return false
    }
}
module.exports = {passwordValidation,textValidation,urlValidation};
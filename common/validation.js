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
    const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g
    if(String(url).match(regex)){
        return true
    }else{
        return false
    }
}
module.exports = {passwordValidation,textValidation,urlValidation};
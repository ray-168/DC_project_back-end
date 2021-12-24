
const { ROLE_USER, ROLE_ADMIN,ROLE_MODERATOR } = require('./constant');


/*  USER ROLES */
const isAdminRole = (roles) => {
	const role = roles.split(' & ');
	return role.indexOf(ROLE_ADMIN) >= 0;
};

const getModeratorRole = () => {
	return ROLE_USER.concat(' & ').concat(ROLE_MODERATOR);
};

const getAdminRole = ()=>{
    return ROLE_USER.concat(' & ').concat(ROLE_MODERATOR).concat(' & ').concat(ROLE_ADMIN);
}

const getUserRole = () => {
	return ROLE_USER;
};

const getRole3Array = (roles) => {
	return roles.split(' & ');
};

const getRole2String = (roles) => {
	return roles.join(' & ');
};

const getAllRoles = () => {
	return [
		ROLE_USER,
		ROLE_ADMIN,
        ROLE_MODERATOR
	]
};



module.exports = {
	// User Role
	getAdminRole,
	getModeratorRole,
	getUserRole,
	isAdminRole,
	getRole3Array,
	getRole2String,
	getAllRoles,
    

};
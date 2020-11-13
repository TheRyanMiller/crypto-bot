const ProfileController = require('./controllers/profile.controller');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware')

exports.routesConfig = function (app) {

    app.get('/profile/getLogs', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.listLogs
    ]);

    app.get('/profile/getConfig', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.getConfig
    ]);

    app.get('/profile/getAllActiveConfigs', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.getAllActiveConfigs
    ]);
    
    app.post('/profile/saveConfig', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.saveConfig
    ]);

    app.post('/profile/setActive', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.setActive
    ]);

    app.get('/profile/getCronsByEmail', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.getCronsByEmail
    ]);

    app.get('/profile/getAllCrons', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.getAllCrons
    ]);

    app.post('/profile/addIcon', [
        ValidationMiddleware.validJWTNeeded,
        ProfileController.addIcon
    ]);
};

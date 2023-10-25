const moment = require('moment')

module.exports = (mongoose, modelName) => {
    const schema = new mongoose.Schema({
        'account': {
            type: String,
            required: true,
            unique: true
        },
        'password': {
            type: String
        },
        'firstName': {
            type: String,
            trim: true
        },
        'lastName': {
            type: String,
            trim: true
        },
        'email': {
            type: String,
            trim: true
        },
        'birthDate': {
            type: String,
            validate: {
                validator: (v) => {
                    return moment(v, 'YYYY-MM-DD', true).isValid()
                },
                message: 'Date format should be YYYY-MM-DD'
            }
        },
        'isActivated': {
            type: Boolean,
            default: false
        },
        'userType': {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        },
        'signType': {
            type: String,
            required: true
        }
    }, {
        timestamps: true
    });

    schema.index({
        "account": 1
    })

    return mongoose.model(modelName, schema);

}
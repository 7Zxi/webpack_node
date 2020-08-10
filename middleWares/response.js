
module.exports = {
    render(template = 'index.html', params) {
        return async (req, res, next) => {
            res.view(template, params);
        }
    },

    send(params = {}) {
        return (req, res, next) => {
            res.send(params);
        }
    },

    json(params = {}) {
        return (req, res, next) => {
            res.json(params);
        }
    }
}

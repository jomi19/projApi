const error = {
    error: function(res, status, source, title, detail = title) {
        return res.status(status).json({
            errors: {
                status: status,
                source: source,
                title: title,
                detail: detail
            }
        });
    },
};

module.exports = error;

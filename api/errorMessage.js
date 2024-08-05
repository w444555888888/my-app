export const errorMessage = (status, message, error = null) => {
    return (req, res, next) => {
        res.status(status).json({
            status: status,
            message: message,
            ...(error && { error: error.message }), 
        });
    };
};

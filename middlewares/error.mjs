export default function error(err, _req, res, _next)
{
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: 'Something went wrong!', 
        message: err.message || 'Internal Server Error' 
      });
}
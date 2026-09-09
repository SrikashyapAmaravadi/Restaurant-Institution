/**
 * Express Middleware: Request Input Validation with Zod
 */
export function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[target];
      const parsed = schema.parse(dataToValidate);
      req[target] = parsed; // Replace with sanitized/coerced data
      next();
    } catch (err) {
      const issueList = err.issues || err.errors;
      if (Array.isArray(issueList) && issueList.length > 0) {
        const issues = issueList.map(e => `${e.path?.join('.') || target}: ${e.message}`);
        return res.status(400).json({
          success: false,
          error: `Validation Error: ${issues.join('; ')}`,
          details: issueList
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Validation Error: ' + err.message
      });
    }
  };
}

export default validate;

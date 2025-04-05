export const resetPasswordTemplate = (resetLink: string) => {
    return {
        subject: 'Reset Your Password',
        body: `
        Hello,
        
        We received a request to reset your password. If you made this request, please click the link below to set a new password:
        
        <a href="${resetLink}">Reset My Password</a>
        
        If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
        
        This link will expire in the next 15 minutes for security reasons.
        
        If you need further assistance, feel free to contact our support team.
        
        Thank you,  
        The Auction Team
        `
    };
};
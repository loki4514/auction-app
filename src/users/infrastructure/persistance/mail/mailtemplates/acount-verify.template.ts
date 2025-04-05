

export const verifyAccountTemplate = (username: string, verificationLink: string) => {
    return {
        subject: 'Verify your account!',
        body: `
        Hi ${username},
        
        Welcome to our auction platform! We're thrilled to have you.
        
        To activate your account and start bidding or listing items, please verify your email address by clicking on the link below:
        
        <a href="${verificationLink}">Verify My Account</a>
        
        If you did not register for an account, you can safely ignore this email.
        
        Thank you for joining us!
        
        The Auction Team
        `
    };
};



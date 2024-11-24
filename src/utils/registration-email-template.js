export default `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body>   
    <main>
        <h2>Thank you for signing up for an account!</h2>
        <p>To complete your registration, please click the button below to verify your email address.</p>
        <a href="http://localhost:5000/user/verify-token/[verification_token]" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Your Email</a>
    </main>
</body>
</html>`;

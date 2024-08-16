# Email Auhtentication Using Nodemailer

This repository contains code for implementing account authentication using Nodemailer in an Express.js application. It includes controllers for registering users, logging in, verifying email with OTP, and resending OTP verification.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mustafa-j-wardeh17/Two-Factor-Authenticating-Using-NodeMailer.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a ".env" file in the root directory of the project and add the following environment variables:
```makefile
AUTH_EMAIL=your-email@example.com
AUTH_PASS=your-example-app-password
```

## API Endpoints

1. Register a User:
Register a new user with email, password, name, and date of birth.

```http
POST /register
```


2. Login:
Login with email and password.

```http
POST /login
```


3. Verify OTP:
Verify email with OTP.

```http
POST /verifyOTP
```


4. Resend OTP Verification:
Resend OTP verification code.

```http
POST /resendVerifyOTP
```


## Controllers
- 'registerController': Registers a new user.
- 'loginController': Logs in a user.
- 'verifyOTP': Verifies email with OTP.
- 'resendOTPVerification': Resends OTP verification code.


## Contributing
Contributions are welcome! Fork the repository and submit a pull request.

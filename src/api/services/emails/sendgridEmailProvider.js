const sgMail = require("@sendgrid/mail");
const { emailConfig } = require('../../../config/vars');

sgMail.setApiKey(emailConfig.apikey);

function sendEmail(data) {
  var htmlContent = '';
  var subject = '';
  if(data.templateName === 'password_reset'){
    const reset_url = `<a style =  'text-decoration: none;
                                    font-size: 15px;
                                    border: 1px solid #fff;
                                    padding: 10px;
                                    background-color: #15c;
                                    color: #fff;
                                    display:inline-block;' 
                          href='http://${data.reset_password_url}'>Reset Password</a>`;
    htmlContent = `<div style='max-width: 500px; font-size: 15px;'>
                    <p>Hello, ${data.username}!</p>
                    <p>Please click the button below to reset your password.</p>
                    <div style='text-align:center; padding-top: 20px;'>
                      ${reset_url}
                    </div>
                  </div>`;
    subject = 'Reset password';
  }

  if(data.templateName === 'user_created'){
    const login_url = `<a style =  'text-decoration: none;
                                    font-size: 15px;
                                    border: 1px solid #fff;
                                    padding: 10px;
                                    background-color: #15c;
                                    color: #fff;
                                    display:inline-block;' 
                          href='http://${data.login_url}'>Login now</a>`;
    htmlContent = `<div style='max-width: 500px; font-size: 15px;'>
                    <p>Hello, ${data.username}!</p>
                    <p>You account succssfully created.</p>
                    <p>Please click the button below to login now.</p>
                    <div style='text-align:center; padding-top: 20px;'>
                      ${login_url}
                    </div>
                  </div>`;
    subject = 'Account created.';
  }

  const msg = {
    to: data.receiver,
    from: data.sender,
    subject: subject,
    html: htmlContent
  };
  
  sgMail.send(msg, (error, result) => {
    if (error) {
        console.log("sendgrid error", error.response.body.errors);
    } else {
        console.log("Sent.");
    }
  });
}
exports.sendEmail = sendEmail;

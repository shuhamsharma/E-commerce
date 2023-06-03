const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect("cee6d5428f704c255c3e05055fa25858","57c95eeb5879c4a4ff49c8ab7e260d2d")
 
module.exports= function send_mail(mail,name,subject,text,callback)
{
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'shubham8520139@jmieti.edu.in',
          Name: 'Shubham',
        },
        To: [
          {
            Email: mail,
            Name: name,
          },
        ],
        Subject: subject,
        TextPart: "Dear "+name+", please verify Your mail by clicking the following button",
        HTMLPart: text
      },
    ],
  })
  request
    .then(result => {
      callback(null,result.body);
    })
    .catch(err => {
      console.log(err);
      callback(err,null)
    })
}
require("dotenv").config();
import nodemailer from "nodemailer";
var fs = require("fs");
var archiver = require("archiver");

let sendSimpleEmail = async (dataSend) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // type: "OAuth2",
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Nguyễn Huy 👻" <nguyengianghuy.bc@gmail.com>', // sender address
    to: dataSend.reciverEmail, // list of receivers
    subject: "Thông tin đặt lịch khám bệnh", // Subject line
    html: getBodyHTMLEmail(dataSend),
  });
};

let getBodyHTMLEmail = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName}</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên BookingCare</p>
    <p>Thông tin đặt lịch khám bệnh</p>
    <div>
        <b>Thời gian: ${dataSend.time}</b>
        <b>Bác sĩ: ${dataSend.doctorName}</b>
        <b>Lý do khám: ${dataSend.reason}</b>
    </div>
    <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.<p/>
    <div>
        <a href=${dataSend.redirectLink} target="_black">Click here</a>
    </div>
    <div>Xin chân thành cảm ơn</div>
  `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3>Dear ${dataSend.patientName}</h3>
    <p>You received this email because you booked an online medical appointment on BookingCare</p>
    <p>Information to book a medical appointment</p>
    <div>
        <b>Time: ${dataSend.time}</b>
        <b>Doctor: ${dataSend.doctorName}</b>
        <b>Reasons for medical examination: ${dataSend.reason}</b>
    </div>
    <p>If the above information is true, please click on the link below to confirm and complete the procedure to book an appointment.<p/>
    <div>
        <a href=${dataSend.redirectLink} target="_black">Click here</a>
    </div>
    <div>Sincerely thank</div>
  `;
  }
  return result;
};

let getBodyHTMLEmailRemedy = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName}</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên <b>BookingCare</b> thành công</p>
    <p>Thông tin đơn thuốc/hóa đơn được gửi trong <b>file đính kèm</b>.</p>
    <p>Mật khẩu để giải nén tệp đính kèm có dạng sau: <span style="font-style: oblique">họvàtênviếtthườngliềnkhôngdấu-3chữsốđầutiêncủasốđiệnthoại</span></p>
    <p>Ví dụ: Họ tên đầy đủ: Lê Văn Xyz, số điện thoại đăng ký khám bệnh: 0123456 thì mật khẩu giải nén là: levanxyz-012</p>
    <p>Trong trường hợp không nhận được tệp đính kèm hoặc không giải nén được. Vui lòng liên hệ hotline: <b>0362138611</b></p>
    <div>Xin chân thành cảm ơn!</div>
  `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3>Dear ${dataSend.patientName}</h3>
    <p>You received this email because you booked an online medical appointment on <b>BookingCare</b></p>
    <p>Prescription/invoice information is sent in <b>the attached file</b>.</p>
    <p>The password to extract the attachment has the following form: <span style="font-style: oblique">firstandlastnameinlowercasewithoutaccents-first3digitsofphonenumber</span></p>
    <p>For example: Full name: Le Van Xyz, phone number for medical examination registration: 0123456, the password to extract is: levanxyz-012</p>
    <p>In case of not receiving the attached file or not decompressing. Please contact hotline: <b>0362138611</b></p>
 
    <div>Sincerely thank</div>
  `;
  }
  return result;
};

let getBodyHTMLEmailCancel = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3>Xin chào ${dataSend.patientName}</h3>
    <p>Bạn nhận được email này vì lịch khám bệnh online trên BookingCare của bạn đã bị hủy bởi lý do ${dataSend.cancelReason}</p>
    <p>Rất mong bạn sẽ quay trở lại vào lần sau.</p>
    
  `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3>Dear ${dataSend.patientName}</h3>
    <p>Bạn nhận được email này vì lịch khám bệnh online trên BookingCare của bạn đã bị hủy bởi lý do là ${dataSend.cancelReason}</p>
    <p>Hope you will come back next time.</p>
  `;
  }
  return result;
};

archiver.registerFormat("zip-encryptable", require("archiver-zip-encryptable"));

const generatePasswordAttachment = (dataSend) => {
  const password = `${dataSend.patientName
    .toLowerCase()
    .replace(" ", "")}-${dataSend.phoneNumberPatient.slice(0, 3)}`;
  return password;
};

let sendAttachment = async (dataSend) => {
  const passwordAttachment = generatePasswordAttachment(dataSend);
  const output = fs.createWriteStream("attachment.zip");

  const archive = archiver("zip-encryptable", {
    zlib: { level: 9 },
    forceLocalTime: true,
    password: passwordAttachment,
  });

  output.on("close", async () => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        // type: "OAuth2",
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Nguyễn Huy 👻" <nguyengianghuy.bc@gmail.com>', // sender address
      to: dataSend.email, // list of receivers
      subject: "Kết quả đặt lịch khám bệnh", // Subject line
      html: getBodyHTMLEmailRemedy(dataSend),
      attachments: [
        {
          // filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
          // content: dataSend.imgBase64.split("base64")[1],
          // encoding: "base64",
          filename: "attachment.zip",
          content: fs.createReadStream("attachment.zip"),
          encoding: "base64",
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="attachment.zip"`,
          },
        },
      ],
    });
  });
  archive.on("error", (err) => {
    console.log(err);
  });

  archive.pipe(output);

  archive.append(
    Buffer.from(
      dataSend.imgBase64
        .split("base64")[1]
        .replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    ),
    { name: "attachment.png" }
  );

  archive.finalize();
};

let cancelAttachment = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // type: "OAuth2",
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Nguyễn Huy 👻" <nguyengianghuy.bc@gmail.com>', // sender address
    to: dataSend.email, // list of receivers
    subject: "Kết quả đặt lịch khám bệnh", // Subject line
    html: getBodyHTMLEmailCancel(dataSend),
  });
};
module.exports = {
  sendSimpleEmail,
  sendAttachment,
  cancelAttachment,
};

import db from "./../models";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

let postSearchHomePage = (keyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: {
          roleId: "R2",
          [Op.or]: [
            {
              firstName: {
                [Op.iLike]: `%${keyword}%`, // Sử dụng Op.iLike thay vì Op.like để thực hiện tìm kiếm không phân biệt chữ hoa và chữ thường
              },
            },
            {
              lastName: {
                [Op.iLike]: `%${keyword}%`, // Sử dụng Op.iLike thay vì Op.like để thực hiện tìm kiếm không phân biệt chữ hoa và chữ thường
              },
            },
          ],
        },
        attributes: ["id", "firstName", "lastName"],
      });

      let specializations = await db.Specialty.findAll({
        where: {
          name: {
            [Op.iLike]: `%${keyword}%`, // Sử dụng Op.iLike thay vì Op.like để thực hiện tìm kiếm không phân biệt chữ hoa và chữ thường
          },
        },
        attributes: ["id", "name"],
      });

      let clinics = await db.Clinic.findAll({
        where: {
          name: {
            [Op.iLike]: `%${keyword}%`, // Sử dụng Op.iLike thay vì Op.like để thực hiện tìm kiếm không phân biệt chữ hoa và chữ thường
          },
        },
        attributes: ["id", "name"],
      });

      resolve({
        doctors: doctors,
        specializations: specializations,
        clinics: clinics,
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

module.exports = {
  postSearchHomePage,
};

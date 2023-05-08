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
                [Op.like]: `%${keyword}%`,
              },
            },
            {
              lastName: {
                [Op.like]: `%${keyword}%`,
              },
            },
          ],
        },
        attributes: ["id", "firstName", "lastName"],
      });

      let specializations = await db.Specialty.findAll({
        where: {
          name: {
            [Op.like]: `%${keyword}%`,
          },
        },
        attributes: ["id", "name"],
      });

      let clinics = await db.Clinic.findAll({
        where: {
          name: {
            [Op.like]: `%${keyword}%`,
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

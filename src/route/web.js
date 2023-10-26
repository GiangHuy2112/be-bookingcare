import express, { Router } from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";
import middlewareController from "../controllers/middlewareController";

const router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get(
    "/delete-crud",
    // middlewareController.verifyTokenAndAdminAndDoctor,
    homeController.deleteCRUD
  );

  router.post("/api/search-home-page", homeController.postSearchHomePage);

  router.post("/api/login", userController.handleLogin);
  router.post("/api/logout", userController.handleLogout);
  // router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.get(
    "/api/get-all-users",
    middlewareController.verifyToken,
    userController.handleGetAllUsers
  );
  router.post("/api/create-new-user", userController.handleCreateNewUser);

  router.post("/api/import-users-csv", userController.handleImportUsersCSV);

  router.put("/api/edit-user", userController.handleEditUser);

  router.delete("/api/delete-user", userController.handleDeleteUser);

  router.get("/api/allcode", userController.getAllCode);

  router.get("/api/top-doctor-home", doctorController.getTopDoctorHome);
  router.get("/api/get-all-doctor", doctorController.getAllDoctors);
  router.get(
    "/api/get-all-doctor-include-image",
    doctorController.getAllDoctorsIncludeImage
  );

  router.post("/api/save-infor-doctor", doctorController.postInforDoctor);
  router.get(
    "/api/get-detail-doctor-by-id",
    doctorController.getDetailDoctorById
  );
  router.post("/api/bulk-create-schedule", doctorController.bulkCreateSchedule);
  router.put("/api/edit-schedule", doctorController.editSchedule);

  router.get("/api/get-schedule-by-date", doctorController.getScheduleByDate);
  router.get(
    "/api/get-extra-infor-doctor-by-id",
    doctorController.getExtraInforDoctorById
  );
  router.get(
    "/api/get-profile-doctor-by-id",
    doctorController.getProfileDoctorById
  );
  router.get(
    "/api/get-list-medical-bill-for-doctor",
    doctorController.getListMedicalBillForDoctor
  );
  router.post("/api/send-remedy", doctorController.sendRemedy);
  router.post("/api/cancel-remedy", doctorController.cancelRemedy);

  router.get("/api/get-all-appointments", patientController.getAllAppointments);
  router.post(
    "/api/patient-book-appointment",
    patientController.postBookAppointment
  );

  router.post("/api/patient", patientController.postPatient);
  router.put("/api/edit-patient", patientController.putPatient);

  router.post(
    "/api/verify-book-appointment",
    patientController.postVerifyBookAppointment
  );

  router.post("/api/create-new-specialty", specialtyController.createSpecialty);
  router.get("/api/get-all-specialty", specialtyController.getAllSpecialty);
  router.get(
    "/api/get-detail-specialty-by-id",
    specialtyController.getDetailSpecialtyById
  );

  router.post("/api/create-new-clinic", clinicController.createClinic);
  router.put("/api/edit-clinic", clinicController.editClinic);
  router.delete("/api/delete-clinic", clinicController.deleteClinic);
  router.get("/api/get-all-clinic", clinicController.getAllClinic);
  router.get(
    "/api/get-detail-clinic-by-id",
    clinicController.getDetailClinicById
  );

  router.post("/refresh", userController.requestRefreshToken);

  router.get("/api/get-all-accountants", doctorController.getAllAccountants);

  router.post(
    "/api/create-new-accountant",
    doctorController.handleCreateNewAccountant
  );
  router.put("/api/edit-accountant", doctorController.handleEditAccountant);
  router.delete(
    "/api/delete-accountant",
    doctorController.handleDeleteAccountant
  );
  return app.use("/", router);
};

module.exports = initWebRoutes;

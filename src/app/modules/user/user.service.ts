import bcrypt from "bcrypt";
import { prisma } from "../../shared/prisma";
import { create } from "domain";


  // ============================
  // WORKER CREATE
  // ============================
    const createWorker = async (payload: any) => {
    const { email, password, name, profilePhoto, contactNumber,  nidNumber } = payload;

    const isExist = await prisma.user.findUnique({ where: { email } });
    if (isExist) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "WORKER",
        approved: false,
      },
    });

    await prisma.worker.create({
      data: {
        email,
        name,
        profilePhoto,
        contactNumber,
        nidNumber,
        userId: user.id,
      },
    });

    return user;
  }

  // ============================
  // SITE ENGINEER CREATE
  // ============================
  const createSiteEngineer = async (payload: any) => {
    const { email, password, name, profilePhoto, contactNumber } = payload;

    const isExist = await prisma.user.findUnique({ where: { email } });
    if (isExist) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SITE_ENGINEER",
        approved: false,
      },
    });

    await prisma.sITE_Engineer.create({
      data: {
        email,
        name,
        profilePhoto,
        contactNumber,
        userId: user.id,
      },
    });

    return user;
  }

  // ============================
  // CHIEF ENGINEER CREATE
  // ============================
const createChiefEngineer = async (payload: any) => {
    const { email, password, name, profilePhoto, contactNumber } = payload;

    const isExist = await prisma.user.findUnique({ where: { email } });
    if (isExist) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "CHIEF_ENGINEER",
        approved: false,
      },
    });

    await prisma.cHIEF_ENGINEER.create({
      data: {
        email,
        name,
        profilePhoto,
        contactNumber,
        userId: user.id,
      },
    });

    return user;
  }

  // ============================
  // ADMIN CREATE
  // ============================
  const createAdmin = async (payload: any) => {
    const { email, password, name, profilePhoto, contactNumber } = payload;

    const isExist = await prisma.user.findUnique({ where: { email } });
    if (isExist) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        approved: true, // Admin auto approved
      },
    });

    await prisma.admin.create({
      data: {
        email,
        name,
        profilePhoto,
        contactNumber,
        userId: user.id,
      },
    });

    return user;
  }

  export const UserService = {  
createWorker,
  createSiteEngineer,
  createChiefEngineer,
  createAdmin
  };

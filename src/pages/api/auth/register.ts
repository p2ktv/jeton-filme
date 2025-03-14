import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password }: { username: string; password: string } =
    req.body;

  if (!username || !password) {
    return res.status(400).send({
      message: "Benutzername und Passwort müssen angegeben werden",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (user) {
    return res.status(400).send({
      message: "Benutzername existiert bereits",
    });
  }

  await prisma.user.create({
    data: {
      username,
      password, // Das ist natürlich überhaupt nicht BP, aber hierfür reicht es
    },
  });

  return res.status(201).send({
    message: "OK",
  });
}

import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

/**
 * Vereinfacht die Erstellung von Prisma-AND/OR-Statements
 */
const parsePrismaStatement = (
  column: string,
  mode: "equals" | "contains",
  value: string | undefined
) => {
  return value
    ? [
        {
          [column]: {
            [mode]:
              column === "age" && /^\d+$/.test(value) ? parseInt(value) : value,
          },
        },
      ]
    : [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  switch (req.method) {
    case "POST":
      const {
        title,
        age: ageFromBody,
        genre: genreFromBody,
        poster,
        description,
      }: {
        title: string;
        age: string;
        genre: string;
        poster: string;
        description: string;
      } = req.body;

      await prisma.film.create({
        data: {
          title,
          description,
          genre: genreFromBody,
          poster,
          age:
            ageFromBody && /^\d+$/.test(ageFromBody)
              ? parseInt(ageFromBody)
              : 0,
          user: {
            connect: {
              username: session.user?.name as string,
            },
          },
        },
      });

      return res.status(201).send({
        message: "OK",
      });
    case "GET":
      const {
        query,
        genre,
        age,
      }: Partial<{ query: string; genre: string; age: string }> = req.query;

      const filme = await (!query && !genre && !age
        ? prisma.film.findMany({
            where: {
              username: session.user?.name as string,
            },
            orderBy: [
              {
                createdAt: "desc",
              },
            ],
          })
        : prisma.film.findMany({
            where: {
              ...(age || genre
                ? {
                    AND: [
                      ...parsePrismaStatement("age", "equals", age),
                      ...parsePrismaStatement("genre", "equals", genre),
                    ],
                  }
                : {}),

              ...(query
                ? {
                    OR: [
                      ...parsePrismaStatement("title", "contains", query),
                      ...parsePrismaStatement("description", "contains", query),
                    ],
                  }
                : {}),
              username: session.user?.name as string,
            },
            orderBy: [
              {
                createdAt: "desc",
              },
            ],
          }));

      return res.status(200).send({
        data: filme ?? [],
      });
    case "DELETE":
      const { id } = req.query as { id: string };
      if (!id) {
        return res.status(400).send({
          message: "ID muss angegeben werden",
        });
      }

      await prisma.film.delete({
        where: {
          id: parseInt(id),
        },
      });

      return res.status(200).send({
        message: "OK",
      });
    default:
      res.status(405).send({ message: "Method not allowed" });
  }
}

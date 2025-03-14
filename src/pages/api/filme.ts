import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

/**
 * Vereinfacht die Erstellung von Prisma-AND/OR-Statements
 */
const parsePrismaStatement = (
  column: "age" | "genre" | "title" | "description",
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

// Interface, um die Struktur der Film-Metadaten zu definieren, die
// im Request Body/Query erwartet werden
interface FilmMetadata {
  title: string;
  age: string;
  genre: string;
  poster: string;
  description: string;
  query: string; // Query-Parameter, um nach Filmen zu suchen
}

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
      }: Omit<FilmMetadata, "query"> = req.body;

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
      const { query, genre, age }: Partial<FilmMetadata> = req.query;

      // Sehr komplexer Query, um entweder:
      // - alle Filme eines Users zu laden, wenn keine Query-Parameter angegeben sind
      // - Filme eines Users nach den Query-Parametern zu filtern
      const filme = await prisma.film.findMany({
        where: {
          ...(!query && !genre && !age
            ? {} // Wenn keine Query-Parameter angegeben sind, wird alles geladen, ohne zusätzliche Filter
            : {
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
                        ...parsePrismaStatement(
                          "description",
                          "contains",
                          query
                        ),
                      ],
                    }
                  : {}),
              }),
          username: session.user?.name as string, // Nur Filme des aktuellen Benutzers laden
        },
        orderBy: [
          {
            createdAt: "desc", // Sortiert nach Erstellungsdatum, damit immer die neusten Filme oben angezeigt werden
          },
        ],
      });

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

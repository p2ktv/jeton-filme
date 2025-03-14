import { Geist, Geist_Mono } from "next/font/google";
import { signOut, signIn, useSession } from "next-auth/react";
import { InferGetStaticPropsType } from "next";
import { Film } from "@prisma/client";
import FilmComponent from "@/components/film";
import LoadingSpinner from "@/components/loader";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface FilmFormProps {
  title: string;
  poster: string;
  description: string;
  genre: string;
  age: string;
}

export const getStaticProps = async (ctx: any) => {
  try {
    const response = await fetch("http://localhost:3000/api/filme");

    const data: {
      data: Film[];
    } = await response.json();

    return {
      props: {
        data: data.data ?? [],
      },
    };
  } catch {
    return {
      props: {
        data: [],
      },
    };
  }
};

export default function Home({
  data: initialData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session, status } = useSession();

  // Die Filme werden hier gespeichert. Anfangs sind es die Filme, die von getStaticProps übergeben wurden.
  // Wenn der Benutzer nach Filmen sucht, werden die Filme in dieser Variable gespeichert.
  const [filme, setFilme] = useState<Film[]>(initialData);

  // Der Ladezustand wird hier gespeichert.
  const [loading, setLoading] = useState(false);

  // Der Render-ID wird genutzt, um die Filme neu zu rendern, wenn sich die Suche ändert.
  const [renderId, setRenderId] = useState(v4());

  // Query beschreibt in diesem Fall die Eingabe über das Input-Feld.
  // Wir nutzen dabei Debouncing, um die Anzahl der API-Requests zu reduzieren und nicht
  // bei jedem Tastendruck einen Request zu senden.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Dies sind die weiteren Filter, nach denen ein Film gesucht werden kann
  const [genre, setGenre] = useState("");
  const [age, setAge] = useState("");

  // Diese Daten werden genutzt, um einen neuen Film zu erstellen
  const [newFilmData, setNewFilmData] = useState<FilmFormProps>({
    title: "",
    poster: "",
    description: "",
    genre: "horror",
    age: "0",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery && !genre && !age && status !== "authenticated") return;

    if (!loading) {
      setLoading(true);
    }
    fetch(
      `http://localhost:3000/api/filme?query=${debouncedQuery}&genre=${genre}&age=${age}`
    )
      .then(async (response) => {
        if (response.status === 200) {
          const data = await response.json();

          setFilme(data.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [debouncedQuery, genre, age, renderId, status]);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] w-full h-full`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-auto">
        <div>
          {status === "loading" ? (
            <div className="p-5">
              <LoadingSpinner />
            </div>
          ) : !session ? (
            <button
              className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
              onClick={async () => {
                await signIn("credentials", {
                  username: null,
                  password: null,
                });
              }}
            >
              Anmelden
            </button>
          ) : (
            <div className="flex flex-row gap-10">
              <div className="flex flex-col gap-4 border-solid border-gray-800 border-2 p-5">
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <label
                      htmlFor="default-search"
                      className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                    >
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>
                      <input
                        type="search"
                        id="default-search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Search Spider Man"
                        value={query}
                        onChange={(e) => {
                          e.preventDefault();
                          setQuery(e.target.value);
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="w-full mx-auto">
                      <select
                        id="genre"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                      >
                        <option value="" selected>
                          Genre
                        </option>
                        <option value="horror">Horror</option>
                        <option value="comedy">Komödie</option>
                        <option value="action">Action</option>
                      </select>
                    </div>
                    <div className="w-full mx-auto">
                      <select
                        id="age"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      >
                        <option value="" selected>
                          Altersfreigabe
                        </option>
                        <option value="0">0</option>
                        <option value="6">6</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  className="
                  grid grid-cols-2 
                  gap-4 border-b-white-100 
                  border-solid pt-5 pb-5 
                  max-h-[calc(4*theme('spacing.20'))] 
                  overflow-y-auto 
                  overflow-x-hidden 
                  [&::-webkit-scrollbar]:w-1
                  [&::-webkit-scrollbar-track]:transparent
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                >
                  {loading ? (
                    <>
                      <div className="p-5">
                        <LoadingSpinner />
                      </div>
                    </>
                  ) : filme.length > 0 ? (
                    filme.map((film) => (
                      <FilmComponent
                        key={film.id}
                        film={film}
                        onDelete={(id) => {
                          fetch(`http://localhost:3000/api/filme?id=${id}`, {
                            method: "DELETE",
                          }).then(() => setRenderId(v4()));
                        }}
                      />
                    ))
                  ) : (
                    <div className="max-w-md">
                      <p className="text-gray-500 italic">
                        Keine Filme gefunden
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <form
                  className="flex flex-col gap-5 border-solid border-gray-800 border-2 p-5"
                  onSubmit={() => {
                    fetch("http://localhost:3000/api/filme", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(newFilmData),
                    }).then(() => setRenderId(v4()));
                  }}
                >
                  <div className="grid grid-cols-4 gap-4 w-full">
                    <div className="col-span-2">
                      <label
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Titel
                      </label>
                      <input
                        type="text"
                        id="title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Spider Man"
                        value={newFilmData.title}
                        onChange={(e) => {
                          setNewFilmData({
                            ...newFilmData,
                            title: e.target.value,
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="poster"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Poster URL
                      </label>
                      <input
                        type="text"
                        id="poster"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="https://image.com/poster.png"
                        value={newFilmData.poster}
                        onChange={(e) => {
                          setNewFilmData({
                            ...newFilmData,
                            poster: e.target.value,
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Beschreibung
                      </label>
                      <input
                        type="text"
                        id="description"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ein cooler Film!"
                        value={newFilmData.description}
                        onChange={(e) => {
                          setNewFilmData({
                            ...newFilmData,
                            description: e.target.value,
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="age"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Age
                      </label>
                      <select
                        id="age"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={newFilmData.age}
                        onChange={(e) => {
                          setNewFilmData({
                            ...newFilmData,
                            age: e.target.value,
                          });
                        }}
                        required
                      >
                        <option value="0">0</option>
                        <option value="6">6</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="genre"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Genre
                      </label>
                      <select
                        id="genre"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={newFilmData.genre}
                        onChange={(e) => {
                          setNewFilmData({
                            ...newFilmData,
                            genre: e.target.value,
                          });
                        }}
                        required
                      >
                        <option value="horror">Horror</option>
                        <option value="comedy">Komödie</option>
                        <option value="action">Action</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-fit focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                  >
                    Film hinzufügen
                  </button>
                </form>
                <button
                  type="button"
                  className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

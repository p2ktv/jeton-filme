import { Film } from "@prisma/client";

export default function FilmComponent({
  film,
  onDelete,
}: {
  film: Film;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      {film.poster && (
        <img
          className="rounded-t-lg object-cover h-[15vh] w-full"
          src={film.poster}
          onError={(e) => {
            e.currentTarget.src =
              "https://www.ahprinting.ca/images/poster-prints-1a.jpg";
          }}
          alt={`${film.title} Poster`}
        />
      )}
      <div className="p-5">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {film.title}
        </h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {film.description}
        </p>
        <div className="flex flex-row gap-1">
          <span className="h-fit bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-gray-300">
            {film.genre.charAt(0).toUpperCase() + film.genre.slice(1)}
          </span>
          <span className="h-fit bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-gray-300">
            {film.age}+
          </span>
          <button
            type="button"
            className="focus:outline-none bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 rounded-md text-xs px-2.5 py-0.5 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            onClick={() => onDelete(film.id)}
          >
            <span className="h-fit text-xs font-medium">Löschen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

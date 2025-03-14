import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session } = useSession();

  if (session) {
    router.push("/filme");
  }

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (error.length < 1) return;

    const tempError = setTimeout(() => setError(""), 5000); // Fehler bleiben 5 Sekunden sichtbar
    return () => clearTimeout(tempError);
  }, [error]);

  useEffect(() => {
    const username = searchParams.get("username");
    const password = searchParams.get("password");
    if (username && password) {
      signIn("credentials", {
        username,
        password,
        callbackUrl: "/filme",
      });
    }

    const errorInURL = searchParams.get("error");
    if (errorInURL) {
      setError("Falsche Anmeldedaten");
    }
  }, [searchParams]);

  return (
    <section className="bg-black dark:bg-black">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-800">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Anmelden oder registrieren
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Benutzername
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="jeton_123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Passwort
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-row gap-1">
                <button
                  className="w-full focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                  onClick={async () => {
                    await signIn("credentials", {
                      username,
                      password,
                      callbackUrl: "/filme",
                    });
                  }}
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username, password }),
                      });
                      if (response.status !== 201) {
                        throw new Error(
                          (await response.json()).message || "An error occurred"
                        );
                      } else {
                        router.push("/filme");
                      }
                    } catch (error) {
                      setError(typeof error === "string" ? error : `${error}`);
                    }
                  }}
                >
                  Registrieren
                </button>
              </div>
            </form>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

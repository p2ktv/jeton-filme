import { useRouter } from "next/navigation";

// Die Root-Route leitet auf die /filme-Route weiter
export default function Home() {
  const router = useRouter();

  router.push("/filme");

  return <></>;
}

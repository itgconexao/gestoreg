import { redirect } from "next/navigation";

export default function Home() {
  // O middleware já leva visitantes sem login para /login.
  redirect("/retirar");
}

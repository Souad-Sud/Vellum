import CreateAccount from "@/components/CreatAccount";
import { Logo } from "../components/Logo";
import { HomeIntroduction } from "@/components/HomeIntroduction";
import { LogIn } from "@/components/LogIn";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-cover bg-center bg-no-repeat">
      {/* Introduction section */}
      <div className="w-full lg:w-3/4 min-w-0 px-4 sm:px-6 lg:px-0">
        <Logo />
        <HomeIntroduction />
      </div>

      {/* Login section */}
      <hr className="my-6 border-gray-300 lg:hidden" />

      <div className="w-full lg:w-1/4 flex flex-col justify-center gap-6 px-4 pb-10 sm:px-8 lg:px-4 lg:pr-10 lg:py-10">
        <LogIn />
        <CreateAccount />
      </div>
    </main>
  );
}
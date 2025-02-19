
import { FormMessage, Message } from "@/components/form-message";
import SignInForm from "@/components/sign-in-form";
import Link from "next/link";
import AcmeLogo from "@/components/acme-logo";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <main className="place-self-center m-auto h-min-screen">
      <div className="flex flex-col gap-4">
      <div className="flex bg-blue-500 p-4 place-content-center rounded-lg">
        <Link href="/">
          <AcmeLogo />
        </Link>
      </div>
<SignInForm searchParams={searchParams} />
</div>
      </main>

  );
}

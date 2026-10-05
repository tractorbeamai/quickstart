import { Link, useRouteContext } from "@tanstack/react-router";

export default function Header() {
  const { session } = useRouteContext({ from: "__root__" });

  return (
    <header className="flex justify-between gap-2 bg-white p-2 text-black">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/example/rest-api">REST API</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/example/chat">Chat</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/example/form">Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/example/posts">Posts</Link>
        </div>
      </nav>

      <div className="px-2 text-sm">
        {session ? (
          <Link to="/example/account">{session.user.email}</Link>
        ) : (
          <Link className="font-bold" to="/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

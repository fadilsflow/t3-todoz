// import Link from "next/link";

// import { LatestPost } from "~/app/_components/post";
import TodoList from "~/components/todos/TodoList";
// import { api, HydrateClient } from "~/trpc/server";
// 
export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // 
  // void api.post.getLatest.prefetch();

  return (
    // <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center dark">
      <div className="container mx-r=auto py-10">
        <TodoList/>
        </div>    
      </main>
    // {/* </HydrateClient> */}
  );
}

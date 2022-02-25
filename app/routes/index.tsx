import { Link } from "remix";
import Layout from "~/components/Layout";
import type { MetaFunction } from "remix";

export const meta: MetaFunction = () => {
	return {
		title: "Remix: So great, it's funny!",
		description: "Remix jokes app. Learn Remix and laugh at the same time!",
	};
};

const Hello = () => {
	return (
		<Layout>
			<div className="flex flex-col min-h-screen items-center justify-center">
				<h1 className="md:text-8xl text-6xl text-center font-bold drop-shadow-md">
					Jokes Remix App
				</h1>
				<Link
					prefetch="intent"
					to={"/jokes"}
					className="bg-white text-black mt-4 font-normal shadow text-3xl px-6 py-1 rounded-full focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:outline-none hover:shadow-lg transition-shadow"
				>
					Click here 👈🏻
				</Link>
			</div>
		</Layout>
	);
};

export default Hello;

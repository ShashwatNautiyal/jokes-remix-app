import { Form, LinksFunction, LoaderFunction, useParams } from "remix";
import { Link, Outlet, useLoaderData } from "remix";
import Container from "~/components/Container";
import Layout from "~/components/Layout";
import { db } from "~/utils/db.server";
import { PlusSmIcon } from "@heroicons/react/solid";
import { classNames } from "~/utils/classnames";
import { getUser } from "~/utils/session.server";
import { User } from "@prisma/client";

type LoaderData = {
	user: User | null;
	jokeListItems: Array<{ id: string; name: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const jokeListItems = await db.joke.findMany({
		take: 5,
		select: { id: true, name: true },
		orderBy: { createdAt: "desc" },
	});

	const user = await getUser(request);

	const data: LoaderData = {
		jokeListItems,
		user,
	};
	return data;
};

export default function JokesRoute() {
	const data = useLoaderData<LoaderData>();
	const params = useParams();

	return (
		<Layout background="bg-gradient-to-br from-blue-200 to-orange-200">
			<Container>
				<div className="flex flex-col gap-4 text-gray-800">
					<div className="flex items-center justify-between gap-4 ">
						<Link prefetch="intent" to={"/"}>
							<h1 className="text-6xl font-semibold">J🤪KES</h1>
						</Link>
						{data.user ? (
							<div className="flex items-center gap-4 font-extrabold text-lg">
								<span className="md:block hidden text-lg font-medium">{`Hi ${data.user.username}`}</span>
								<Form action="/logout" method="post">
									<button
										className="inline-flex touch-manipulation items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-400 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
										type="submit"
									>
										Logout
									</button>
								</Form>
							</div>
						) : (
							<Link
								prefetch="intent"
								className="inline-flex h-min items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-400 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
								to="/login"
							>
								Login
							</Link>
						)}
					</div>
					<main className="flex md:flex-row flex-col-reverse md:gap-8 gap-4">
						<div className="flex flex-col gap-4">
							<Link
								prefetch="intent"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-400 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
								to="."
							>
								Get a random joke
							</Link>
							<p>Here are a few more jokes to check out:</p>
							<ul className="flex gap-1 flex-col rounded-lg">
								{data.jokeListItems.map((joke) => (
									<Link
										prefetch="intent"
										className={classNames(
											params.jokeId === joke.id ? "bg-gray-100" : "",
											"px-2 py-1 border border-gray-400 rounded-md hover:bg-gray-200 hover:shadow-md"
										)}
										key={joke.id}
										to={joke.id}
									>
										<li>{joke.name}</li>
									</Link>
								))}
							</ul>
							<Link
								prefetch="intent"
								to="new"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-400 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
							>
								Add your own
								<PlusSmIcon className="h-6 w-6" />
							</Link>
						</div>
						<Outlet />
					</main>
				</div>
			</Container>
		</Layout>
	);
}

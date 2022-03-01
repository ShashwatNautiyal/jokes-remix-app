import { Joke, User } from "@prisma/client";
import { Link, LoaderFunction, useLoaderData, useCatch } from "remix";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

type LoaderData = {
	randomJoke: Joke;
	user: User | null;
};

export const loader: LoaderFunction = async () => {
	const count = await db.joke.count();
	const randomRowNumber = Math.floor(Math.random() * count);
	const [randomJoke] = await db.joke.findMany({
		take: 1,
		skip: randomRowNumber,
	});
	if (!randomJoke) {
		throw new Response("No random joke found", {
			status: 404,
		});
	}
	const user = await db.user.findUnique({
		where: { id: randomJoke.jokesterId },
	});
	const data: LoaderData = { randomJoke, user };
	return data;
};

export default function JokesIndexRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div className="flex flex-col flex-1 gap-4">
			<p className="font-medium text-2xl">Here's a random joke:</p>
			<p className="font-normal text-lg">{data.randomJoke.content}</p>
			<Link to={data.randomJoke.id}>-By {data.user?.username}</Link>
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 404) {
		return (
			<div className="bg-red-500 px-3 py-2 h-min">
				<h1 className="text-lg font-medium">There are no jokes to display.</h1>
			</div>
		);
	}
	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
	return <div className="px-3 py-2 bg-red-500 h-min">I did a whoopsies.</div>;
}

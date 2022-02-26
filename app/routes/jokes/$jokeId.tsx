import type { Joke } from "@prisma/client";
import {
	Link,
	ActionFunction,
	LoaderFunction,
	useLoaderData,
	useParams,
	useCatch,
	redirect,
	MetaFunction,
	Form,
} from "remix";
import { db } from "~/utils/db.server";
import { requireUserId, getUserId } from "~/utils/session.server";

type LoaderData = { joke: Joke; isOwner: boolean };

export const loader: LoaderFunction = async ({ params, request }) => {
	const userId = await getUserId(request);

	const joke = await db.joke.findUnique({
		where: { id: params.jokeId },
	});
	if (!joke) {
		throw new Response("What a joke! Not found.", {
			status: 404,
		});
	}
	if (!joke) throw new Error("Joke not found");
	const data: LoaderData = { joke, isOwner: userId === joke.jokesterId };
	return data;
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	if (form.get("_method") === "delete") {
		const userId = await requireUserId(request);
		const joke = await db.joke.findUnique({
			where: { id: params.jokeId },
		});
		if (!joke) {
			throw new Response("Can't delete what does not exist", { status: 404 });
		}
		if (joke.jokesterId !== userId) {
			throw new Response("Pssh, nice try. That's not your joke", {
				status: 401,
			});
		}
		await db.joke.delete({ where: { id: params.jokeId } });
		return redirect("/jokes");
	}
};

export const meta: MetaFunction = ({ data }: { data: LoaderData | undefined }) => {
	if (!data) {
		return {
			title: "No joke",
			description: "No joke found",
		};
	}
	return {
		title: `${data.joke.name} joke`,
		description: `Enjoy the "${data.joke.name}" joke and much more`,
	};
};

export default function JokeRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div className="flex flex-col flex-1 gap-4">
			<p className="font-medium text-2xl">Here's your hilarious joke:</p>
			<p className="font-normal text-lg">{data.joke.content}</p>
			<Link to=".">{data.joke.name} Permalink</Link>
			{data.isOwner ? (
				<Form method="post">
					<input type="hidden" name="_method" value="delete" />
					<button
						type="submit"
						className="inline-flex h-min touch-manipulation items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-400 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
					>
						Delete
					</button>
				</Form>
			) : null}
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();
	if (caught.status === 404) {
		return (
			<div className="bg-red-500 px-3 py-2 h-min">
				<h1 className="text-base font-normal">Huh? What the heck is "{params.jokeId}"?</h1>
			</div>
		);
	}

	if (caught.status === 401) {
		return (
			<div className="bg-red-500 px-3 py-2 h-min">
				Sorry, but {params.jokeId} is not your joke.
			</div>
		);
	} else {
		throw new Error(`Unhandled error: ${caught.status}`);
	}
}

export function ErrorBoundary() {
	const { jokeId } = useParams();
	return (
		<div className="px-3 py-2 bg-red-500 h-min">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
	);
}

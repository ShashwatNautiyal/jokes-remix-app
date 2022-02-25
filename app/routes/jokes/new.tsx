import { ActionFunction, Form, LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { useActionData, redirect, json, useCatch, Link } from "remix";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
	if (content.length < 10) {
		return `That joke is too short`;
	}
}

function validateJokeName(name: string) {
	if (name.length < 2) {
		return `That joke's name is too short`;
	}
}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		name: string | undefined;
		content: string | undefined;
	};
	fields?: {
		name: string;
		content: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const name = form.get("name");
	const content = form.get("content");
	const userId = await requireUserId(request);
	// we do this type check to be extra sure and to make TypeScript happy
	// we'll explore validation next!
	if (typeof name !== "string" || typeof content !== "string") {
		throw new Error(`Form not submitted correctly.`);
	}

	const fieldErrors = {
		name: validateJokeName(name),
		content: validateJokeContent(content),
	};

	const fields = { name, content };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const joke = await db.joke.create({ data: { ...fields, jokesterId: userId } });
	return redirect(`/jokes/${joke.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);
	if (!userId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return {};
};

export default function NewJokeRoute() {
	const actionData = useActionData<ActionData>();

	return (
		<div className="flex flex-col gap-4">
			<p className="font-medium text-2xl">Add your own hilarious joke</p>
			<Form method="post" className="flex flex-col gap-4">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						Name:
					</label>
					<div className="mt-1">
						<input
							type="text"
							defaultValue={actionData?.fields?.name}
							name="name"
							id="name"
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
							placeholder=""
							aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
							aria-describedby={
								actionData?.fieldErrors?.name ? "name-error" : undefined
							}
						/>
					</div>
					{actionData?.fieldErrors?.name ? (
						<p className="text-sm text-rose-600" role="alert" id="name-error">
							{actionData.fieldErrors.name}
						</p>
					) : null}
				</div>
				<div>
					<label htmlFor="content" className="block text-sm font-medium text-gray-700">
						Add your comment
					</label>
					<div className="mt-1">
						<textarea
							defaultValue={actionData?.fields?.content}
							rows={4}
							name="content"
							id="content"
							aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
							aria-describedby={
								actionData?.fieldErrors?.content ? "content-error" : undefined
							}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
						/>
					</div>
					{actionData?.fieldErrors?.content ? (
						<p className="text-sm text-rose-600" role="alert" id="content-error">
							{actionData.fieldErrors.content}
						</p>
					) : null}
				</div>
				<div>
					<button
						type="submit"
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-400 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
					>
						Add
					</button>
				</div>
			</Form>
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className="bg-red-500 px-3 py-2 h-min">
				<p>You must be logged in to create a joke.</p>
				<Link prefetch="intent" className="text-base font-medium text-blue-700" to="/login">
					Login
				</Link>
			</div>
		);
	}
}

export function ErrorBoundary() {
	return (
		<div className="px-3 py-2 bg-red-500 h-min">
			Something unexpected went wrong. Sorry about that.
		</div>
	);
}

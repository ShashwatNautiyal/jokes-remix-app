import Container from "~/components/Container";
import Layout from "~/components/Layout";
import { ActionFunction, Form, MetaFunction } from "remix";
import { useActionData, json, Link, useSearchParams } from "remix";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";

function validateUsername(username: unknown) {
	if (typeof username !== "string" || username.length < 3) {
		return `Usernames must be at least 3 characters long`;
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== "string" || password.length < 6) {
		return `Passwords must be at least 6 characters long`;
	}
}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		username: string | undefined;
		password: string | undefined;
	};
	fields?: {
		loginType: string;
		username: string;
		password: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const loginType = form.get("loginType");
	const username = form.get("username");
	const password = form.get("password");
	const redirectTo = form.get("redirectTo") || "/jokes";
	if (
		typeof loginType !== "string" ||
		typeof username !== "string" ||
		typeof password !== "string" ||
		typeof redirectTo !== "string"
	) {
		return badRequest({
			formError: `Form not submitted correctly.`,
		});
	}

	const fields = { loginType, username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields });

	switch (loginType) {
		case "login": {
			const user = await login({ username, password });
			console.log({ user });
			if (!user) {
				return badRequest({
					fields,
					formError: `Username/Password combination is incorrect`,
				});
			}
			return createUserSession(user.id, redirectTo);
		}
		case "register": {
			const userExists = await db.user.findFirst({
				where: { username },
			});
			if (userExists) {
				return badRequest({
					fields,
					formError: `User with username ${username} already exists`,
				});
			}
			const user = await register({ username, password });
			if (!user) {
				return badRequest({
					fields,
					formError: `Something went wrong trying to create a new user.`,
				});
			}

			return createUserSession(user.id, redirectTo);
		}
		default: {
			return badRequest({
				fields,
				formError: `Login type invalid`,
			});
		}
	}
};

export const meta: MetaFunction = () => {
	return {
		title: "Remix Jokes | Login",
		description: "Login to submit your own jokes to Remix Jokes!",
	};
};

export default function Login() {
	const actionData = useActionData<ActionData>();
	const [searchParams] = useSearchParams();

	return (
		<Layout background="bg-gradient-to-br from-fuchsia-200 to-red-200">
			<Container>
				<div className="min-h-full text-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
					<div className="sm:mx-auto sm:w-full sm:max-w-md">
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Sign in to your account
						</h2>
					</div>

					<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
						<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
							<Form
								aria-describedby={
									actionData?.formError ? "form-error-message" : undefined
								}
								className="space-y-6"
								action="#"
								method="post"
							>
								<input
									type="hidden"
									name="redirectTo"
									value={searchParams.get("redirectTo") ?? undefined}
								/>
								<fieldset className="flex items-center gap-4 justify-center">
									<legend className="sr-only">Login or Register?</legend>
									<label>
										<input
											type="radio"
											name="loginType"
											value="login"
											defaultChecked={
												!actionData?.fields?.loginType ||
												actionData?.fields?.loginType === "login"
											}
										/>{" "}
										Login
									</label>
									<label>
										<input
											type="radio"
											name="loginType"
											value="register"
											defaultChecked={
												actionData?.fields?.loginType === "register"
											}
										/>{" "}
										Register
									</label>
								</fieldset>

								<div>
									<label
										htmlFor="username-input"
										className="block text-sm font-medium text-gray-700"
										defaultValue={actionData?.fields?.username}
										aria-invalid={Boolean(actionData?.fieldErrors?.username)}
										aria-describedby={
											actionData?.fieldErrors?.username
												? "username-error"
												: undefined
										}
									>
										Username
									</label>
									<div className="mt-1">
										<input
											type="text"
											id="username-input"
											name="username"
											autoComplete="username"
											required
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
									</div>
									{actionData?.fieldErrors?.username ? (
										<p
											className="text-xs text-rose-700"
											role="alert"
											id="username-error"
										>
											{actionData?.fieldErrors.username}
										</p>
									) : null}
								</div>
								<div>
									<label
										htmlFor="password-input"
										className="block text-sm font-medium text-gray-700"
									>
										Password
									</label>
									<div className="mt-1">
										<input
											id="password-input"
											name="password"
											type="password"
											autoComplete="current-password"
											defaultValue={actionData?.fields?.password}
											required
											aria-invalid={
												Boolean(actionData?.fieldErrors?.password) ||
												undefined
											}
											aria-describedby={
												actionData?.fieldErrors?.password
													? "password-error"
													: undefined
											}
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
										{actionData?.fieldErrors?.password ? (
											<p
												className="text-xs text-rose-700"
												role="alert"
												id="password-error"
											>
												{actionData?.fieldErrors.password}
											</p>
										) : null}
									</div>
								</div>

								<div id="form-error-message">
									{actionData?.formError ? (
										<p className="text-xs text-rose-700" role="alert">
											{actionData?.formError}
										</p>
									) : null}
								</div>

								<div>
									<button
										type="submit"
										className="w-full touch-manipulation flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									>
										actionData?.fields?.loginType === "login" ? Sign in : Register
									</button>
								</div>
							</Form>
						</div>
					</div>
				</div>
			</Container>
			<ul className="flex justify-center relative pb-4 w-full gap-4 items-center">
				<li>
					<Link prefetch="intent" to="/">
						Home
					</Link>
				</li>
				<li>
					<Link prefetch="intent" to="/jokes">
						Jokes
					</Link>
				</li>
			</ul>
		</Layout>
	);
}
